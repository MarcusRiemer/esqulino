require 'rails_helper'
require 'securerandom' # To make up unique slugs on the fly
require 'fileutils'    # To ease file comparision

require_dependency 'seed_manager'

# Removes attributes that may conflict when checking for equality
#
# * "created_at" and "updated_at" seem to slightly change when
#   stored in the database. Possibly Postgres doesn't want to
#   store the same amount of precision as Rails offers.
def identifying_attributes(model)
  model.attributes.except("created_at", "updated_at")
end

RSpec.describe "Seed Manager" do
  let (:seedManager) { SeedManager.new }

  before(:each) do
    # Running these testcases will create loads of temporary files in the
    # directory specified in the `sqlino.yml` at `seed -> data_dir`. We
    # ensure that we don't leave too much of a mess by cleaning up all
    # the time.
    FileUtils.rm_rf(seedManager.seed_data_dir, :secure => true)
  end

  context "Grammar" do
    it "stores, destroys and loads an empty grammar (CREATE)" do
      gOrig = FactoryBot.create(:grammar, name: "Test Grammar")

      seedManager.store_grammar(gOrig)

      gOrig.destroy!
      gLoad = seedManager.load_grammar(gOrig.id)

      expect(identifying_attributes(gOrig)).to eq identifying_attributes(gLoad)
    end

    it "stores, destroys and loads an empty grammar by ID (CREATE)" do
      gOrig = FactoryBot.create(:grammar, name: "Test Grammar")

      seedManager.store_grammar(gOrig.id)

      gOrig.destroy!
      gLoad = seedManager.load_grammar(gOrig.id)

      expect(identifying_attributes(gOrig)).to eq identifying_attributes(gLoad)
    end

    it "stores and reloads an empty grammar (CREATE)" do
      gOrig = FactoryBot.create(:grammar, name: "Test Grammar")

      seedManager.store_grammar(gOrig)

      # Making a change after storing
      gOrig.update_column("name", "changed")

      gLoad = seedManager.load_grammar(gOrig.id)
      gOrig.reload

      expect(identifying_attributes(gOrig)).to eq identifying_attributes(gLoad)
    end
  end

  context "BlockLanguage" do
    it "stores, destroys and loads an empty block language (CREATE)" do
      bOrig = FactoryBot.create(:block_language)

      seedManager.store_block_language(bOrig)

      bOrig.destroy!
      bLoad = seedManager.load_block_language(bOrig.id)

      expect(identifying_attributes(bOrig)).to eq identifying_attributes(bLoad)
    end

    it "stores, destroys and loads an empty block language by id (CREATE)" do
      bOrig = FactoryBot.create(:block_language)

      seedManager.store_block_language(bOrig.id)

      bOrig.destroy!
      bLoad = seedManager.load_block_language(bOrig.id)

      expect(identifying_attributes(bOrig)).to eq identifying_attributes(bLoad)
    end

    it "stores and reloads an empty block language (CREATE)" do
      bOrig = FactoryBot.create(:block_language)

      seedManager.store_block_language(bOrig)

      # Making a change after storing
      bOrig.update_column("name", "changed")

      gLoad = seedManager.load_block_language(bOrig.id)
      bOrig.reload

      expect(identifying_attributes(bOrig)).to eq identifying_attributes(gLoad)
    end
  end

  context "BlockLanguageGenerator" do
    it "stores, destroys and loads an empty block language generator (CREATE)" do
      bOrig = FactoryBot.create(:block_language_generator)

      seedManager.store_block_language_generator(bOrig)

      bOrig.destroy!
      bLoad = seedManager.load_block_language_generator(bOrig.id)

      expect(identifying_attributes(bOrig)).to eq identifying_attributes(bLoad)
    end

    it "stores, destroys and loads an empty block language generator by ID (CREATE)" do
      bOrig = FactoryBot.create(:block_language_generator)

      seedManager.store_block_language_generator(bOrig.id)

      bOrig.destroy!
      bLoad = seedManager.load_block_language_generator(bOrig.id)

      expect(identifying_attributes(bOrig)).to eq identifying_attributes(bLoad)
    end

    it "stores and reloads an empty block language (CREATE)" do
      bOrig = FactoryBot.create(:block_language_generator)

      seedManager.store_block_language_generator(bOrig)

      # Making a change after storing
      bOrig.update_column("name", "changed")

      gLoad = seedManager.load_block_language_generator(bOrig.id)
      bOrig.reload

      expect(identifying_attributes(bOrig)).to eq identifying_attributes(gLoad)
    end
  end

  context "Project" do
    it "stores, destroys and loads an empty project (CREATE)" do
      pOrig = FactoryBot.create(:project, name: "Test")

      seedManager.store_project(pOrig)

      pOrig.destroy!
      pLoad = seedManager.load_project(pOrig.id)

      expect(identifying_attributes(pOrig)).to eq identifying_attributes(pLoad)
    end

    it "stores, destroys and loads an empty project by id (CREATE)" do
      pOrig = FactoryBot.create(:project, name: "Test")

      seedManager.store_project(pOrig.id)

      pOrig.destroy!
      pLoad = seedManager.load_project(pOrig.id)

      expect(identifying_attributes(pOrig)).to eq identifying_attributes(pLoad)
    end

    it "stores, destroys and loads an empty project by filepath (CREATE)" do
      pOrig = FactoryBot.create(:project, name: "Test")

      seedManager.store_project(pOrig.id)

      pOrig.destroy!
      pLoad = seedManager.load_project(seedManager.seed_projects_file pOrig.id)

      expect(identifying_attributes(pOrig)).to eq identifying_attributes(pLoad)
    end

    it "stores, destroys and loads (via slug) an empty project (CREATE)" do
      # This is trickier then it should be: Because the database
      # is wiped between different runs the testcases happily create
      # projects that have clashing slugs. These clashing slugs are then
      # stored with the seed manager, which in turn means that loading
      # something via slug returns a different instance.
      #
      # We avoid this by using unique slugs in exactly these tests.
      #
      # TODO: Maybe using FakeFS would mitigate this better?
      pOrig = FactoryBot.create(:project, name: "Test", slug: SecureRandom.hex)

      seedManager.store_project(pOrig)

      pOrig.destroy!
      pLoad = seedManager.load_project(pOrig.slug)

      expect(identifying_attributes(pOrig)).to eq identifying_attributes(pLoad)
    end

    it "stores and reloads an empty project (UPDATE)" do
      pOrig = FactoryBot.create(:project, name: "Test")
      seedManager.store_project(pOrig)

      # Making a change after storing
      pOrig.update_column("name", "changed")

      pLoad = seedManager.load_project(pOrig.id)
      pOrig.reload

      expect(identifying_attributes(pOrig)).to eq identifying_attributes(pLoad)
    end

    it "stores, destroys and loads a project with a single code resource (CREATE)" do
      pOrig = FactoryBot.create(:project, name: "Test")
      cOrig = FactoryBot.create(:code_resource, project: pOrig)

      seedManager.store_project(pOrig)

      cOrig.destroy!
      pOrig.destroy!

      pLoad = seedManager.load_project(pOrig.id)
      cLoad = pLoad.code_resources[0]

      expect(identifying_attributes(pOrig)).to eq identifying_attributes(pLoad)
      expect(identifying_attributes(cOrig)).to eq identifying_attributes(cLoad)
    end

    it "stores and reloads a project with a single code resource (UPDATE)" do
      pOrig = FactoryBot.create(:project, name: "Test")
      cOrig = FactoryBot.create(:code_resource, project: pOrig)

      seedManager.store_project(pOrig)

      # Making a change after storing
      cOrig.update_column("name", "changed")

      pLoad = seedManager.load_project(pOrig.id)
      cLoad = pLoad.code_resources[0]
      cOrig.reload

      expect(identifying_attributes(pOrig)).to eq identifying_attributes(pLoad)
      expect(identifying_attributes(cOrig)).to eq identifying_attributes(cLoad)
    end

    it "stores, destroys and loads a project with a single project source (CREATE)" do
      pOrig = FactoryBot.create(:project, name: "Test")
      sOrig = FactoryBot.create(:project_source, project: pOrig)

      seedManager.store_project(pOrig)

      sOrig.destroy!
      pOrig.destroy!

      pLoad = seedManager.load_project(pOrig.id)
      sLoad = pLoad.project_sources[0]

      expect(identifying_attributes(pOrig)).to eq identifying_attributes(pLoad)
      expect(identifying_attributes(sOrig)).to eq identifying_attributes(sLoad)
    end

    it "stores and reloads a project with a single project source (CREATE)" do
      pOrig = FactoryBot.create(:project, name: "Test")
      sOrig = FactoryBot.create(:project_source, project: pOrig)

      seedManager.store_project(pOrig)

      # Making a change after storing
      sOrig.update_column("title", "changed")

      pLoad = seedManager.load_project(pOrig.id)
      sLoad = pLoad.project_sources[0]
      sOrig.reload

      expect(identifying_attributes(pOrig)).to eq identifying_attributes(pLoad)
      expect(identifying_attributes(sOrig)).to eq identifying_attributes(sLoad)
    end

    it "stores, destroys and loads a project with a single database (CREATE)" do
      pOrig = FactoryBot.create(:project, name: "Test")
      dOrig = FactoryBot.create(:project_database, :table_key_value, project: pOrig)

      seedManager.store_project(pOrig)

      # Break circular dependency
      pOrig.default_database = nil
      pOrig.save!

      dOrig.destroy!
      pOrig.destroy!

      pLoad = seedManager.load_project(pOrig.id)
      dLoad = pLoad.project_databases[0]
      pOrig.reload

      expect(identifying_attributes(pOrig)).to eq identifying_attributes(pLoad)
      expect(identifying_attributes(dOrig)).to eq identifying_attributes(dLoad)

      # Ensure that the databases are identical
      seed_db_file = seedManager.seed_project_databases_sqlite_file(pOrig.id, dOrig.id)
      data_db_file = dOrig.sqlite_file_path
      expect(FileUtils.compare_file(seed_db_file, data_db_file)).to be true
    end

    it "stores and reloads a project with a single database (UPDATE)" do
      pOrig = FactoryBot.create(:project, name: "Test")
      dOrig = FactoryBot.create(:project_database, :table_key_value, project: pOrig)

      seedManager.store_project(pOrig)

      # Paths to database files
      seed_db_file = seedManager.seed_project_databases_sqlite_file(pOrig.id, dOrig.id)
      data_db_file = dOrig.sqlite_file_path

      # Modify the actual database
      dOrig.table_bulk_insert(
        "key_value",
        ['key', 'value'],
        [
          ['10', 'zehn']
        ]
      )

      # Databases are now different
      expect(FileUtils.compare_file(seed_db_file, data_db_file)).to be false

      # Modify the model
      dOrig.name = "changed"
      dOrig.save!

      pLoad = seedManager.load_project(pOrig.id)
      dLoad = pLoad.project_databases[0]
      pOrig.reload
      dOrig.reload

      expect(identifying_attributes(pOrig)).to eq identifying_attributes(pLoad)
      expect(identifying_attributes(dOrig)).to eq identifying_attributes(dLoad)

      # Ensure that the databases are identical again
      expect(FileUtils.compare_file(seed_db_file, data_db_file)).to be true
    end

    it "fails to load a project with a code resource with an unavailable block language" do
      pOrig = FactoryBot.create(:project, name: "Test")
      cOrig = FactoryBot.create(:code_resource, project: pOrig)
      bOrig = cOrig.block_language

      second_block_language = FactoryBot.create(:block_language)
      pOrig.block_languages << second_block_language

      seedManager.store_project(pOrig)

      # Remove references to the "original" block language so it can be destroyed
      pOrig.block_languages.destroy(bOrig)
      cOrig.block_language = second_block_language
      cOrig.save

      # Destroy the block language
      bOrig.destroy!

      # Loading the project must now result in an error
      expect { seedManager.load_project(pOrig.id) }.to raise_error(ActiveRecord::RecordInvalid)
    end

    it "moves back the data folder if an error occurs" do
      pOrig = FactoryBot.create(:project, name: "Test")
      dOrig = FactoryBot.create(:project_database, :table_key_value, project: pOrig)

      # This row count will be used to track whether the live
      # database has been overwritten in the failed loading attempt
      orig_row_count = dOrig.table_row_count("key_value")

      # Reference a new block language
      bOrig = FactoryBot.create(:block_language)
      pOrig.block_languages << bOrig

      # Save everything
      seedManager.store_project(pOrig)

      # Make a change to the database after storing
      dOrig.table_bulk_insert(
        "key_value",
        ['key', 'value'],
        [['10', 'zehn']]
      )
      expect(dOrig.table_row_count("key_value")).to eq(orig_row_count + 1)

      # Destroy the block language so loading must now fail
      pOrig.block_languages.clear
      bOrig.destroy!

      # Loading the project must now result in an error
      expect { seedManager.load_project(pOrig.id) }.to raise_error(ActiveRecord::RecordInvalid)

      # And may not change the database
      expect(dOrig.table_row_count("key_value")).to eq(orig_row_count + 1)
    end
  end
end