require "rails_helper"
require "securerandom" # To make up unique slugs on the fly
require "fileutils"    # To ease file comparision

RSpec.describe Seed::GrammarSeed do
  let(:seed_data_dir) { Rails.configuration.sqlino[:seed][:data_dir] }
  let(:grammar) { FactoryBot.create(:grammar, name: "Test Grammar") }
  let(:payload) { grammar }

  let!(:subject) { described_class.new(payload) }

  before(:each) do
    FileUtils.rm_rf(seed_data_dir, :secure => true)
  end

  describe "grammar seed" do
    context "when payload is grammar object"
    let(:payload) { grammar }
    it "returns object" do
      expect(subject.seed).to be_a Grammar
    end

    context "when payload is grammar id" do
      let(:payload) { grammar.id }

      it "returns object" do
        expect(subject.seed).to be_a Grammar
      end
    end

    context "when payload is project slug" do
      let(:payload) { grammar.slug }

      it "returns project" do
        expect(subject.seed).to be_a Grammar
      end
    end

    context "store, destorys and loads" do
      it "an empty grammar (CREATE)" do
        gOrig = FactoryBot.create(:grammar, name: "Test Grammar")

        Seed::GrammarSeed.new(gOrig).start_store

        gOrig.destroy!

        gLoad = Seed::GrammarSeed.new(gOrig.id).start_load
        gLoadData = Grammar.find_by(id: gOrig.id)

        expect(identifying_attributes(gOrig)).to eq identifying_attributes(gLoadData)
      end

      it "stores, destroys and loads an empty grammar by ID (CREATE)" do
        gOrig = FactoryBot.create(:grammar, name: "Test Grammar")

        Seed::GrammarSeed.new(gOrig.id).start_store

        gOrig.destroy!
        gLoad = Seed::GrammarSeed.new(gOrig).start_load
        gLoadData = Grammar.find_by(id: gOrig.id)

        expect(identifying_attributes(gOrig)).to eq identifying_attributes(gLoadData)
      end
    end

    context "stores and reloads " do
      it "an empty grammar (CREATE)" do
        gOrig = FactoryBot.create(:grammar, name: "Test Grammar")

        Seed::GrammarSeed.new(gOrig).start_store

        # Making a change after storing
        gOrig.update_column("name", "changed")

        gLoad = Seed::GrammarSeed.new(gOrig.id).start_load
        gLoadData = Grammar.find_by(id: gOrig.id)
        gOrig.reload

        expect(identifying_attributes(gOrig)).to eq identifying_attributes(gLoadData)
      end
    end
  end

  def identifying_attributes(model)
    model.attributes.except("created_at", "updated_at")
  end
end
