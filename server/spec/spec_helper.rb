require 'simplecov'
require 'simplecov-cobertura'
require 'webmock/rspec'

RSpec.configure do |config|
  # We want coverage reports
  SimpleCov.start 'rails' do
    add_group 'Policies', 'app/policies'
    add_group 'Seed Manager', 'app/services/seed'
    add_group 'GraphQL', 'app/graphql'
  end
  SimpleCov.formatters = SimpleCov::Formatter::MultiFormatter.new(
    [
      SimpleCov::Formatter::HTMLFormatter,
      SimpleCov::Formatter::CoberturaFormatter
    ]
  )

  config.expect_with :rspec do |expectations|
    expectations.include_chain_clauses_in_custom_matcher_descriptions = true
  end

  config.mock_with :rspec do |mocks|
    mocks.verify_partial_doubles = true
  end

  config.shared_context_metadata_behavior = :apply_to_host_groups
  config.filter_run_when_matching :focus
  config.example_status_persistence_file_path = 'spec/examples.txt'

  config.disable_monkey_patching!

  if config.files_to_run.one?
    config.default_formatter = 'doc' if config.files_to_run.one?
    config.order = :random
    Kernel.srand config.seed
  end

  # No test should ever connect to any external host
  WebMock.disable_net_connect!(allow_localhost: true)
end
