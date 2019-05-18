require "rails_helper"
require "securerandom" # To make up unique slugs on the fly
require "fileutils"    # To ease file comparision

RSpec.describe Seed::BlockLanguageGeneratorSeed do
  let(:seed_data_dir) { Rails.configuration.sqlino["seed"]["data_dir"] }
  let(:block_language_generator) { FactoryBot.create(:block_language_generator) }
  let(:payload) { block_language_generator }

  let(:subject) { described_class.new(payload) }

  before(:each) do
    FileUtils.rm_rf(seed_data_dir, :secure => true)
  end

  describe "blcok language generator seed" do
    context "when payload is grammar object"
    let(:payload) { block_language_generator }
    it "returns object" do
      expect(subject.seed).to be_a BlockLanguageGenerator
    end

    context "when payload is grammar id" do
      let(:payload) { block_language_generator.id }

      it "returns object" do
        expect(subject.seed).to be_a BlockLanguageGenerator
      end
    end

    context "store, destorys and loads" do
      it "an empty block language generator (CREATE)" do
        bOrig = FactoryBot.create(:block_language_generator)

        Seed::BlockLanguageGeneratorSeed.new(bOrig).start_store

        bOrig.destroy!
        bLoad = Seed::BlockLanguageGeneratorSeed.new(bOrig.id).start_load
        bLoadData = BlockLanguageGenerator.find_by(id: bOrig.id)

        expect(identifying_attributes(bOrig)).to eq identifying_attributes(bLoadData)
      end

      it "an empty block language generator by ID (CREATE)" do
        bOrig = FactoryBot.create(:block_language_generator)

        Seed::BlockLanguageGeneratorSeed.new(bOrig.id).start_store

        bOrig.destroy!
        bLoad = Seed::BlockLanguageGeneratorSeed.new(bOrig.id).start_load
        bLoadData = BlockLanguageGenerator.find_by(id: bOrig.id)

        expect(identifying_attributes(bOrig)).to eq identifying_attributes(bLoadData)
      end
    end

    context "stores and reloads " do
      it "an empty block language generator (UPDATE)" do
        bOrig = FactoryBot.create(:block_language_generator)

        Seed::BlockLanguageGeneratorSeed.new(bOrig).start_store

        # Making a change after storing
        bOrig.update_column("name", "changed")

        gLoad = Seed::BlockLanguageGeneratorSeed.new(bOrig.id).start_load
        gLoadData = BlockLanguageGenerator.find_by(id: bOrig.id)
        bOrig.reload

        expect(identifying_attributes(bOrig)).to eq identifying_attributes(gLoadData)
      end
    end
  end

  def identifying_attributes(model)
    model.attributes.except("created_at", "updated_at")
  end
end
