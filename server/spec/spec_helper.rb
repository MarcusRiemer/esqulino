require 'database_cleaner'
require 'fakefs/spec_helpers'
require 'simplecov'

RSpec.configure do |config|
  # We want coverage reports
  SimpleCov.start 'rails'

  # And we need fake filesystems
  config.include FakeFS::SpecHelpers, fakefs: true

  config.expect_with :rspec do |expectations|
    expectations.include_chain_clauses_in_custom_matcher_descriptions = true
  end

  config.mock_with :rspec do |mocks|
    mocks.verify_partial_doubles = true
  end

  config.shared_context_metadata_behavior = :apply_to_host_groups
  config.filter_run_when_matching :focus
  config.example_status_persistence_file_path = "spec/examples.txt"

  config.disable_monkey_patching!

  if config.files_to_run.one?
    config.default_formatter = "doc" if config.files_to_run.one?
    config.order = :random
    Kernel.srand config.seed
  end
end
