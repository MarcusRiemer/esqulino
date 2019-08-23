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
    it "rejects missing root and missing types" do
      res = FactoryBot.build(:grammar, model: Hash.new)

      res.validate
      expect(res.errors["model"]).not_to be_empty
    end

    it "factory created" do
      res = FactoryBot.build(:grammar)

      res.validate
      expect(res.errors["model"]).to be_empty
    end
  end
end
