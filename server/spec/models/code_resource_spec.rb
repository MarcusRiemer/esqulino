require 'rails_helper'

RSpec.describe CodeResource, type: :model do
  context "name" do
    it "rejects a missing name" do
      res = FactoryBot.build(:code_resource, name: nil)

      res.validate
      expect(res.errors["name"].length).to be 1
    end

    it "rejects a blank name" do
      res = FactoryBot.build(:code_resource, name: " ")

      res.validate
      expect(res.errors["name"].length).to be 1
    end

    it "allows very short names" do
      res = FactoryBot.build(:code_resource, name: "a")

      res.validate
      expect(res.errors["name"].length).to be 0
    end
  end

  context "ast" do
    it "rejects nodes without a name" do
      res = FactoryBot.build(
        :code_resource,
        ast: {
          "language" => "specLang"
        }
      )

      res.validate
      expect(res.errors["ast"].length).to be 1
      expect(res.compiled).to be nil
    end

    it "rejects nodes without a language" do
      res = FactoryBot.build(
        :code_resource,
        ast: {
          "name" => "specRoot"
        }
      )

      res.validate
      expect(res.errors["ast"].length).to be 1
      expect(res.compiled).to be nil
    end

    it "accepts a missing root" do
      res = FactoryBot.build(:code_resource, ast: nil)
      res.validate
      expect(res.errors["ast"].length).to be 0
    end

    it "accepts a valid tree" do
      res = FactoryBot.build(
        :code_resource,
        ast: {
          "language" => "specLang",
          "name" => "specRoot"
        }
      )

      # Tree is valid, no errors expected
      res.validate
      expect(res.errors["ast"].length).to be 0

      # Compiled should be *something* after saving
      res.save!
      expect(res.compiled).not_to be_nil
    end
  end

  it "project is required" do
    res = FactoryBot.build(:code_resource, project: nil)

    res.validate
    expect(res.errors[:project].length).to be 1
  end

  it "block language is required" do
    res = FactoryBot.build(:code_resource, block_language: nil)

    res.validate
    expect(res.errors[:block_language].length).to be 1
  end
end
