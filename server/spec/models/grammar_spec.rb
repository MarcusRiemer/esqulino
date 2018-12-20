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
      expect(res.errors["slug"].length).to be 1
    end

    it "stores two grammars with empty slugs" do
      FactoryBot.create(:grammar, slug: nil)
      FactoryBot.create(:grammar, slug: nil)

      expect(Grammar.all.count).to be 2
    end
  end

  context "name" do
    it "rejects a missing name" do
      res = FactoryBot.build(:grammar, name: nil)

      res.validate
      expect(res.errors["name"].length).to be 1
    end
  end

  context "technical_name" do
    it "rejects a missing technical_name" do
      res = FactoryBot.build(:grammar, technical_name: nil)

      res.validate
      # Empty and does not match the regex
      expect(res.errors["technical_name"].length).to be 2
    end

    it "accepts valid names" do
      ["a", "a1", "a_1", "sql", "css", "html", "html5", "ms_sql"].each do |name|
        res = FactoryBot.build(:grammar, technical_name: name)

        res.validate
        expect(res.errors["technical_name"].length).to be 0
      end
    end

    it "rejects names that begin with non-letters" do
      ["_", "1"].each do |non_letter|
        res = FactoryBot.build(:grammar, technical_name: "#{non_letter}_valid")

        res.validate
        expect(res.errors["technical_name"].length).to be 1
      end
    end

    it "rejects names that contain fancy characters" do
      ["\"", "'", ",", "{", "}", "(", ")", "[", "]", "-", "/", "\\", ":"].each do |fancy|
        res = FactoryBot.build(:grammar, technical_name: "a#{fancy}")

        res.validate
        expect(res.errors["technical_name"].length).to be 1
      end
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
