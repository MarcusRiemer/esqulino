require 'tempfile'

FactoryBot.define do
  factory :project_database do
    association :project, factory: :project
  end

  # A database instance that stores all its data in a temporary file
  factory :tempfile_project_database, class: ProjectDatabase do
    after(:build) do |db|
      allow(db).to receive(:sqlite_file_path) { Tempfile.new.path }
    end
  end

  # A database instance that stores all its data in memory.
  #
  # BEWARE: If operations on the database use different connections
  # (default, admin, read_only) each of these connections will see
  # different data.
  factory :in_memory_project_database, class: ProjectDatabase do
    after(:build) do |db|
      allow(db).to receive(:sqlite_file_path) { ':memory:' }
    end
  end
end
