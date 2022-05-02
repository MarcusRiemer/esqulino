require 'spec_helper'
require 'factory_bot'
require 'database_cleaner/active_record'

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
          .map { |r| JSON.pretty_generate(r.except("root_schema")) }
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

  # Sends the GraphQL query with the given name and the given variables.
  # Expects that there shouldn't be any errors in the response by default.
  def send_query(
        query_name:,
        variables: {},
        expect_no_errors: true,
        exp_http_status: 200
      )
    post "/api/graphql",
         headers: { "CONTENT_TYPE" => "application/json" },
         params: {
           operationName: query_name,
           variables: variables
         }.to_json

    aggregate_failures "Basic GraphQL Response" do
      # Graphql usually returns with status: 200
      # https://medium.com/@takewakamma/graphql-error-handling-with-graphql-ruby-653aa2a129f6
      # https://www.graph.cool/docs/faq/api-eep0ugh1wa/#how-does-error-handling-work-with-graphcool

      expect(response.status).to eq exp_http_status
      expect(response.media_type).to eq "application/json"
    end

    json_data = JSON.parse(response.body)

    # Possibly ensure that there are no errors
    if expect_no_errors
      aggregate_failures "GraphQL Query Errors" do
        recurse_no_error(json_data, [])
      end
    end

    return json_data
  end

  # Shorthand to execute free form graphql queries
  def execute_query(
        query: nil,
        variables: {},
        operation_name: nil,
        language: ["de"],
        user: User.guest,
        expect_no_errors: true
      )

    # Possibly retrieve the query by name
    query = get_query(operation_name) if query.nil?

    # Language and user are expected to be present for all queries
    context = {
      user: user,
      language: language
    }

    # Directly execute the query against the schema
    result = ServerSchema.execute(query, variables: variables, context: context, operation_name: operation_name)
    json_data = result.as_json

    # Possibly ensure that there are no errors
    if expect_no_errors
      aggregate_failures "GraphQL Query Errors" do
        recurse_no_error(json_data, [])
      end
    end

    return json_data
  end

  private

  def recurse_no_error(data, path)
    if data.is_a? Hash
      data.each do |key,value|
        if key === "errors"
          expect(value).to eq([]), "Path: Root" + path.join(".")
        else
          recurse_no_error(value, path + [key])
        end
      end
    end
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
    deleted_cookies = response.cookies.keys.filter { |name| response.cookies[name].nil? }
    "Deleted cookies [#{deleted_cookies.join ', '}] but expected [#{names.join ', '}] to be deleted"
  end
end

RSpec.configure do |config|
  config.infer_spec_type_from_file_location!

  config.filter_rails_from_backtrace!

  # Setup database DatabaseCleaner
  # make sure our tests starts with clean slate
  config.before(:suite) do
    DatabaseCleaner.clean_with(:truncation)
    DatabaseCleaner.strategy = :transaction
  end

  config.around(:each) do |example|
    DatabaseCleaner.cleaning do
      example.run
    end
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
