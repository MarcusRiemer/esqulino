require "rails_helper"

RSpec.describe Seed::ProjectSeed do
  let(:project) { FactoryBot.create(:project, name: "Test Proejct") }
  let(:project_payload) { project }
  # let(:dependencies) do
  #   {
  #     ProjectUsesBlockLanguageSeed => "project_uses_block_languages",
  #     CodeResourceSeed => "code_resources",
  #     ProjectSourceSeed => "project_sources",
  #     ProjectDatabaseSeed => "project_databases",
  #     ProjectDefaultDatabaseSeed => "default_database",
  #   }
  # end
  let(:subject) { described_class.new(project_payload) }

  before do
    FileUtils.rm_rf(Seed::Base::BASE_SEED_DIRECTORY, :secure => true)
  end

  describe "#project" do
    context "when payload is project object"
    it "returns object" do
      expect(subject.seed).to be_a Project
    end

    context "when payload is project id" do
      let(:project_payload) { project.id }

      it "returns object" do
        expect(subject.seed.first).to be_a Project
      end
    end

    context "when payload is project slug" do
      let(:project_payload) { project.slug }

      it "returns project" do
        expect(subject.seed.first).to be_a Project
      end
    end
  end

  describe "store" do
    it "stores the project in the seed directory" do
      subject.start_store
      Dir.chdir(Seed::Base::BASE_SEED_DIRECTORY)
      expect(Dir.children("projects")).to eq(["#{project.id}" + ".yaml"])
    end
  end
end
