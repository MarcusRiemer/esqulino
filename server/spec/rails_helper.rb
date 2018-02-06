# This file is copied to spec/ when you run 'rails generate rspec:install'
require 'spec_helper'
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
    
    def initialize(schema_name)
      @schema_name = schema_name
    end
    
    def matches?(actual)
      schema = @@json_schema_storage.get_schema @schema_name

      @result = JSON::Validator.fully_validate(schema, actual,
                                               :errors_as_objects => true,
                                               :parse_data => false)
      @result.empty?
    end

    def failure_message
      @result
        .map{|e| e[:message].sub(e[:schema].to_s, %Q["#{@schema_name}"])}
        .join "\n"
    end
  end

  # The helper function to avoid typing "new" all the time
  def validate_against(schema_name)
    ValidateAgainstMatcher.new(schema_name)
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

  config.include ValidateAgainstMatcher
end
