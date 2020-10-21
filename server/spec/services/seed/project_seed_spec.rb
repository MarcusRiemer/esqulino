require "rails_helper"
require "securerandom" # To make up unique slugs on the fly
require "fileutils"    # To ease file comparision

RSpec.describe Seed::ProjectSeed do
  let(:seed_data_dir) { Rails.configuration.sqlino[:seed][:data_dir] }
  let(:project) { FactoryBot.create(:project, name: { "en" => "Test Project" }) }
  let(:payload) { project }

  let!(:subject) { described_class.new(payload) }

  before(:each) do
    FileUtils.rm_rf(seed_data_dir, :secure => true)
  end

  describe "project seed" do
    context "when payload is project object"
    let(:payload) { project }
    it "returns object" do
      expect(subject.seed).to be_a Project
    end

    context "when payload is project id" do
      let(:payload) { project.id }

      it "returns object" do
        expect(subject.seed).to be_a Project
      end
    end

    context "when payload is project slug" do
      let(:payload) { project.slug }

      it "returns project" do
        expect(subject.seed).to be_a Project
      end
    end

    context "store, destorys and loads" do
      it "an empty project (CREATE)" do
        pOrig = FactoryBot.create(:project)
        Seed::ProjectSeed.new(pOrig).start_store

        pOrig.destroy!
        pLoad = Seed::ProjectSeed.new(pOrig.id).start_load

        pLoadData = Project.find_by(id: pOrig.id)

        expect(identifying_attributes(pOrig)).to eq identifying_attributes(pLoadData)
      end

      it "an empty project by id (CREATE)" do
        pOrig = FactoryBot.create(:project)
        Seed::ProjectSeed.new(pOrig.id).start_store

        pOrig.destroy!
        pLoad = Seed::ProjectSeed.new(pOrig.id).start_load
        pLoadData = Project.find_by(id: pOrig.id)

        expect(identifying_attributes(pOrig)).to eq identifying_attributes(pLoadData)
      end

      it "an empty project by filepath (CREATE)" do
        pOrig = FactoryBot.create(:project)

        Seed::ProjectSeed.new(pOrig.id).start_store

        seed_file = "#{pOrig.id}.yaml"
        pOrig.destroy!

        pLoad = Seed::ProjectSeed.new(seed_file).start_load
        pLoadData = Project.find_by(id: pOrig.id)

        expect(identifying_attributes(pOrig)).to eq identifying_attributes(pLoadData)
      end

      it "an empty project by slug (CREATE)" do
        pOrig = FactoryBot.create(:project, slug: "test123")

        Seed::ProjectSeed.new(pOrig.id).start_store

        pOrig.destroy!

        pLoad = Seed::ProjectSeed.new(pOrig.slug).start_load
        pLoadData = Project.find_by(id: pOrig.id)

        expect(identifying_attributes(pOrig)).to eq identifying_attributes(pLoadData)
      end

      it "(via slug) an empty project (CREATE)" do
        # This is trickier then it should be: Because the database
        # is wiped between different runs the testcases happily create
        # projects that have clashing slugs. These clashing slugs are then
        # stored with the seed manager, which in turn means that loading
        # something via slug returns a different instance.
        #
        # We avoid this by using unique slugs in exactly these tests.
        pOrig = FactoryBot.create(:project, slug: "a" + SecureRandom.hex)

        Seed::ProjectSeed.new(pOrig).start_store

        pOrig.destroy!
        pLoad = Seed::ProjectSeed.new(pOrig.slug).start_load
        pLoadData = Project.find_by(id: pOrig.id)

        expect(identifying_attributes(pOrig)).to eq identifying_attributes(pLoadData)
      end

      it "a project with a single code resource (CREATE)" do
        pOrig = FactoryBot.create(:project)
        cOrig = FactoryBot.create(:code_resource, project: pOrig)

        Seed::ProjectSeed.new(pOrig).start_store

        cOrig.destroy!
        pOrig.destroy!

        pLoad = Seed::ProjectSeed.new(pOrig.id).start_load
        pLoadData = Project.find_by(id: pOrig.id)
        cLoad = pLoadData.code_resources[0]

        expect(identifying_attributes(pOrig)).to eq identifying_attributes(pLoadData)
        expect(identifying_attributes(cOrig)).to eq identifying_attributes(cLoad)
      end

      it "a project with a single project source (CREATE)" do
        pOrig = FactoryBot.create(:project)
        sOrig = FactoryBot.create(:project_source, project: pOrig)

        Seed::ProjectSeed.new(pOrig).start_store

        sOrig.destroy!
        pOrig.destroy!

        pLoad = Seed::ProjectSeed.new(pOrig.id).start_load
        pLoadData = Project.find_by(id: pOrig.id)
        sLoad = pLoadData.project_sources[0]

        expect(identifying_attributes(pOrig)).to eq identifying_attributes(pLoadData)
        expect(identifying_attributes(sOrig)).to eq identifying_attributes(sLoad)
      end

      it "a project with a single database (CREATE)" do
        pOrig = FactoryBot.create(:project)
        dOrig = FactoryBot.create(:project_database, :table_key_value, project: pOrig)

        Seed::ProjectSeed.new(pOrig).start_store

        ActiveRecord::Base.connection.disable_referential_integrity do
          dOrig.destroy!
          pOrig.destroy!
        end

        pLoad = Seed::ProjectSeed.new(pOrig.id).start_load
        pLoadData = Project.find_by(id: pOrig.id)
        dLoad = pLoadData.project_databases[0]
        pOrig.reload

        expect(identifying_attributes(pOrig)).to eq identifying_attributes(pLoadData)
        expect(identifying_attributes(dOrig)).to eq identifying_attributes(dLoad)

        # Ensure that the databases are identical
        seed_db_file = File.join Seed::ProjectDatabaseSeed.load_directory, "#{dOrig.id}.sqlite"
        # seed_db_file = seedManager.seed_project_databases_sqlite_file(pOrig.id, dOrig.id)
        data_db_file = dOrig.sqlite_file_path
        expect(FileUtils.compare_file(seed_db_file, data_db_file)).to be true
      end
    end

    context "stores and reloads" do
      it "an empty project (UPDATE)" do
        pOrig = FactoryBot.create(:project)
        Seed::ProjectSeed.new(pOrig).start_store
        # Making a change after storing
        pOrig.update_column("name", { "de" => "changed" })

        pLoad = Seed::ProjectSeed.new(pOrig.id).start_load
        pLoadData = Project.find_by(id: pOrig.id)
        pOrig.reload

        expect(identifying_attributes(pOrig)).to eq identifying_attributes(pLoadData)
      end

      it "a project with a single project source (CREATE)" do
        pOrig = FactoryBot.create(:project)
        sOrig = FactoryBot.create(:project_source, project: pOrig)

        Seed::ProjectSeed.new(pOrig).start_store

        # Making a change after storing
        sOrig.update_column("title", "changed")

        pLoad = Seed::ProjectSeed.new(pOrig.id).start_load
        pLoadData = Project.find_by(id: pOrig.id)
        sLoad = pLoadData.project_sources[0]
        sOrig.reload

        expect(identifying_attributes(pOrig)).to eq identifying_attributes(pLoadData)
        expect(identifying_attributes(sOrig)).to eq identifying_attributes(sLoad)
      end

      it "a project with a single database (UPDATE)" do
        pOrig = FactoryBot.create(:project)
        dOrig = FactoryBot.create(:project_database, :table_key_value, project: pOrig)

        Seed::ProjectSeed.new(pOrig).start_store

        data_db_file = dOrig.sqlite_file_path
        seed_db_file = File.join Seed::ProjectDatabaseSeed.load_directory, "#{dOrig.id}.sqlite"
        # Modify the actual database
        dOrig.table_bulk_insert(
          "key_value",
          ["key", "value"],
          [
            ["10", "zehn"],
          ]
        )

        # Databases are now different
        expect(FileUtils.compare_file(seed_db_file, data_db_file)).to be false

        # Modify the model
        dOrig.name = "changed"
        dOrig.save!

        pLoad = Seed::ProjectSeed.new(pOrig.id).start_load
        pLoadData = Project.find_by(id: pOrig.id)
        dLoad = pLoadData.project_databases[0]
        pOrig.reload
        dOrig.reload

        expect(identifying_attributes(pOrig)).to eq identifying_attributes(pLoadData)
        expect(identifying_attributes(dOrig)).to eq identifying_attributes(dLoad)

        # Ensure that the databases are identical again
        expect(FileUtils.compare_file(seed_db_file, data_db_file)).to be true
      end
    end

    context "with errors" do
      it "throws if project cant be found by slug" do
        expect do
          Seed::ProjectSeed.new("nonexistant").start_load
        end.to raise_exception RuntimeError
      end

      it "fails to load a project with a code resource with an unavailable block language" do
        pOrig = FactoryBot.create(:project)
        cOrig = FactoryBot.create(:code_resource, project: pOrig)
        bOrig = cOrig.block_language

        second_block_language = FactoryBot.create(:block_language)
        pOrig.block_languages << second_block_language

        Seed::ProjectSeed.new(pOrig).start_store

        # Remove references to the "original" block language so it can be destroyed
        pOrig.block_languages.destroy(bOrig)
        cOrig.block_language = second_block_language
        cOrig.save

        # Destroy the block language
        bOrig.destroy!

        # Loading the project must now result in an error
        expect { Seed::ProjectSeed.new(pOrig.id).start_load }.to raise_error(ActiveRecord::RecordInvalid)
      end
    end
  end

  describe "store" do
    context "project files" do
      let(:payload) { project }
      it "stores the project in the seed directory" do
        subject.start_store
        Dir.chdir(Seed::Base::BASE_SEED_DIRECTORY)
        expect(Dir.children("projects")).not_to be_empty
      end
    end
  end

  def identifying_attributes(model)
    model.attributes.except("created_at", "updated_at")
  end
end
