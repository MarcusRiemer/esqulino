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
        schemer = JSONSchemer.schema(schema)
        @result = schemer.validate(actual).to_a
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
        # Omit the whole schema from the shown output
        @result
          .map {|r| JSON.pretty_generate(r.except("root_schema")) }
          .join "\n"
      end
    end
  end

  # The helper function to avoid typing "new" all the time
  def validate_against(schema_name)
    ValidateAgainstMatcher.new(schema_name)
  end
end

# Extensions to the core models that ease working with the specs
module ApplicationRecordSpecExtensions
  def api_attributes_except(exclude = [], include_boilerplate = false)
    # Timestamps and ID are not included by default
    if not include_boilerplate
      exclude += ["created_at", "updated_at", "id"]
    end

    # Retrieve relevant attributes and properly name them
    attributes
      .except(*exclude)
      .transform_keys { |k| k.camelize(:lower) }
  end

  def api_attributes(include_timestamp = false)
    api_attributes_except([], include_timestamp)
  end
end

module GraphqlSpecHelper
  include GraphqlQueryHelper
  def send_query(query_name:, variables: {})
    post "/api/graphql", headers: { "CONTENT_TYPE" => "application/json" },
         params: {
             operationName: query_name,
             variables: variables
         }.to_json
  end

  def execute_query(query: nil, variables: {}, operation_name: nil, language: ["de"])
      query = get_query(operation_name) if query.nil?
      context = {
          user: create(:user, :guest),
          language: language
      }
      result = ServerSchema.execute(query, variables: variables, context: context, operation_name: operation_name)
      return result.as_json
    rescue => e
      return {"errors":[e]}
  end
end


ApplicationRecord.include ApplicationRecordSpecExtensions

# More natural way to expect cookies that should be set
RSpec::Matchers.define :set_cookie do |names|
  match do |response|
    names.all? do |name|
      not response.cookies[name].nil?
    end
  end

  failure_message do |actual|
    "Got cookies [#{actual.cookies.keys.join ', '}] but expected [#{names.join ', '}]"
  end
end

# More natural way to expect cookies that should be deleted
RSpec::Matchers.define :delete_cookie do |names|
  match do |response|
    names.all? do |name|
      response.cookies.keys.include?(name) and response.cookies[name].nil?
    end
  end

  failure_message do |actual|
    deleted_cookies = response.cookies.keys.filter {|name| response.cookies[name].nil? }
    "Deleted cookies [#{deleted_cookies.join ', '}] but expected [#{names.join ', '}] to be deleted"
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

  # Reset changes to the filesystem after the tests have run
  config.after(:suite) do
    `make -C #{File.join ::Rails.root, ".."} test-reset`
  end

  # Ensure we can actually validate stuff
  config.include ValidateAgainstMatcher
  config.include GraphqlSpecHelper
end

FactoryBot::SyntaxRunner.class_eval do
  include RSpec::Mocks::ExampleMethods
end
