# coding: utf-8

require 'tempfile'

FactoryBot.define do
  factory :project_database do
    association :project, factory: :project

    sequence(:name) { |n| "db #{n}" }

    after(:create) do |db|
      db.project.update!(default_database: db)
    end

    trait :tables_references do
      after(:create) do |db|
        db.table_create(
          {
            "name" => "B",
            "columns" => [
              {
                "name" => "key",
                "type" => "INTEGER",
                "index" => 0,
                "primary" => true,
                "notNull" => true,
                "dfltValue" => nil
              },
            ],
            "foreignKeys" => [],
            "systemTable" => false
          }
        )

        db.table_create(
          {
            "name" => "A",
            "columns" => [
              {
                "name" => "key",
                "type" => "INTEGER",
                "index" => 0,
                "primary" => true,
                "notNull" => true,
                "dfltValue" => nil
              },
            ],
            "foreignKeys" => [
              {
                "references" => [
                  {
                    "toTable" => "B",
                    "toColumn" => "key",
                    "fromColumn" => "key"
                  }
                ]
              }
            ],
            "systemTable" => false
          }
        )

        db.table_bulk_insert(
          "B",
          ['key'],
          [
            ['0'],
            ['1'],
            ['2'],
            ['3'],
            ['4'],
            ['5'],
          ]
        )

        db.table_bulk_insert(
          "A",
          ['key'],
          [
            ['0'],
            ['1'],
            ['2'],
            ['3'],
          ]
        )

        db.refresh_schema!
      end
    end

    # A simple table that stores the nams of all digits
    #
    # Key | Value
    # ----+------
    # 0   | Null
    # 1   | Eins
    # ... | ...
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
                "notNull" => true,
                "dfltValue" => nil
              },
              {
                "name" => "value",
                "type" => "TEXT",
                "index" => 1,
                "primary" => false,
                "notNull" => false,
                "dfltValue" => "value"
              }
            ],
            "foreignKeys" => [],
            "systemTable" => false
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

    # A simple table that simply counts
    #
    # number
    # ---
    # 0
    # 1
    # ...
    trait :table_numbers do
      transient do
        row_count { 10 }
      end

      after(:create) do |db, options|
        db.table_create(
          {
            "name" => "numbers",
            "columns" => [
              {
                "name" => "number",
                "type" => "INTEGER",
                "index" => 0,
                "primary" => true,
                "notNull" => true,
                "dfltValue" => nil
              },
            ],
            "foreignKeys" => [],
            "systemTable" => false
          }
        )

        db.table_bulk_insert(
          "numbers",
          ['number'],
          (1..options.row_count).map { |i| [i] }
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
