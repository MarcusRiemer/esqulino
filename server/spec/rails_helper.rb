# This file is copied to spec/ when you run 'rails generate rspec:install'
require 'spec_helper'
require 'factory_bot'

ENV['RAILS_ENV'] ||= 'test'
require File.expand_path('../../config/environment', __FILE__)
# Prevent database truncation if the environment is production
abort("The Rails environment is running in production mode!") if Rails.env.production?
require 'rspec/rails'

Dir[Rails.root.join('spec/support/**/*.rb')].each { |f| require f }

# Checks for pending migrations and applies them before tests are run.
# If you are not using ActiveRecord, you can remove this line.
ActiveRecord::Migration.maintain_test_schema!

# Custom matcher to ensure we satisfy existing schemas
module ValidateAgainstMatcher
  # The actual matcher
  class ValidateAgainstMatcher
    # Providing a single schema storage here to avoid reloads
    # of the same schema over and over again.
    @@json_schema_storage = JsonSchemaStorage.new Rails.configuration.sqlino['schema_dir']

    # Remembers the name of the schema that should be verified
    def initialize(schema_name)
      @schema_name = schema_name
    end

    # Checks whether the given instance is valid in the context of this schema.
    def matches?(actual)
      schema = @@json_schema_storage.schemas[@schema_name]

      if schema 

        @result = JSON::Validator.fully_validate(schema, actual,
                                                 :errors_as_objects => true,
                                                 :parse_data => false)
        @result.empty?
      else
        @error = "Could not find schema #{@schema_name}"
        false
      end
    end

    def failure_message
      if @error
        @error
      else
        @result
          .map{|e| e[:message].sub(e[:schema].to_s, %Q["#{@schema_name}"])}
          .join "\n"
      end
    end
  end

  # The helper function to avoid typing "new" all the time
  def validate_against(schema_name)
    ValidateAgainstMatcher.new(schema_name)
  end
end

# Some utility functions that are helpful during testing
module Helpers
  # Some tests need the illusion of a writeable projects directory
  def fakefs_clone_projects_dir!
    FakeFS::FileSystem.clone(Rails.application.config.sqlino[:projects_dir])
  end
end

RSpec.configure do |config|
  config.fixture_path = "#{::Rails.root}/spec/fixtures"

  config.use_transactional_fixtures = true

  config.infer_spec_type_from_file_location!

  config.filter_rails_from_backtrace!

  # Setup database DatabaseCleaner
  # make sure our tests starts with clean slate
  config.before(:suite) do
    DatabaseCleaner.clean_with(:truncation)
  end

  config.before(:each) do
    DatabaseCleaner.strategy = :transaction
  end

  config.after(:suite) do
    DatabaseCleaner.clean
  end

  # Ensure we can actually validate stuff
  config.include ValidateAgainstMatcher

  # Ensure we have our helper functions available
  config.include Helpers
end

FactoryBot::SyntaxRunner.class_eval do
  include RSpec::Mocks::ExampleMethods
end
