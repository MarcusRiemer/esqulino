require 'rails_helper'

RSpec.describe Grammar, type: :model do
  context "slug" do
    it "allows empty slugs" do
      res = FactoryBot.build(:grammar, slug: nil)
      expect(res.valid?).to be true
    end

    it "rejects slugs that are too short" do
      res = FactoryBot.build(:grammar, slug: "")

      res.validate
      expect(res.errors["slug"].length).to eq 1
    end

    it "rejects identical slugs" do
      FactoryBot.create(:grammar, slug: "duplicate")
      expect { FactoryBot.create(:grammar, slug: "duplicate") }.to raise_error ActiveRecord::RecordInvalid

      expect(Grammar.all.count).to eq 1
    end

    it "stores two grammars with empty slugs" do
      FactoryBot.create(:grammar, slug: nil)
      FactoryBot.create(:grammar, slug: nil)

      expect(Grammar.all.count).to eq 2
      expect(Grammar.where(slug: nil).count).to eq 2
    end
  end

  context "name" do
    it "rejects a missing name" do
      res = FactoryBot.build(:grammar, name: nil)

      res.validate
      expect(res.errors["name"].length).to eq 1
    end
  end

  context "model" do
    it "rejects missing model" do
      res = FactoryBot.build(:grammar, model: nil)

      res.validate
      expect(res.errors["model"]).not_to be_empty
    end

    it "factory created: Empty" do
      res = FactoryBot.build(:grammar)

      res.validate
      expect(res.errors["model"]).to be_empty
    end

    it "factory created: Empty" do
      res = FactoryBot.build(:grammar, :model_single_type)

      res.validate
      expect(res.errors["model"]).to be_empty
    end
  end

  context "based on CodeResource" do
    it "may exist without a associated code resource" do
      res = FactoryBot.build(:grammar, generated_from: nil)

      res.validate
      expect(res.errors["generated_from"]).to be_empty
    end

    it "may not exist without a associated non-existant code resource" do
      res = FactoryBot.build(:grammar, generated_from_id: SecureRandom.uuid)

      expect { res.save }.to raise_error ActiveRecord::InvalidForeignKey
    end

    it "may associate a code resource" do
      res = FactoryBot.build(:grammar, generated_from: nil)
    end
  end
end
