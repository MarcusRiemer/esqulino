# coding: utf-8
require 'tempfile'

FactoryBot.define do
  factory :project_database do
    association :project, factory: :project

    after(:create) do |db|
      db.project.update!(default_database: db)
    end

    trait :table_key_value do
      after(:create) do |db|
        db.table_create(
          {
            "name" => "key_value",
            "columns" => [
              {
                "name" => "key",
                "type" => "INTEGER",
                "index" => 0,
                "primary" => true,
                "not_null" => true,
                "dflt_value" => nil
              },
              {
                "name" => "value",
                "type" => "TEXT",
                "index" => 1,
                "primary" => false,
                "not_null" => false,
                "dflt_value" => "value"
              }
            ],
            "foreign_keys" => []
          }
        )

        db.table_bulk_insert(
          "key_value",
          ['key', 'value'],
          [
            ['0', 'null'],
            ['1', 'eins'],
            ['2', 'zwei'],
            ['3', 'drei'],
            ['4', 'vier'],
            ['5', 'fünf'],
            ['6', 'secs'],
            ['7', 'sibn'],
            ['8', 'acht'],
            ['9', 'neun'],
          ]
        )

        db.refresh_schema!
      end
    end
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
