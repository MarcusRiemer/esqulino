require 'rails_helper'

RSpec.describe CodeResource, type: :model do
  context "name" do
    it "rejects an missing name" do
      res = FactoryBot.build(:code_resouce, name: nil)

      expect(res.validate).to be false
      expect(res.errors["name"].length).to be 1
    end

    it "rejects an blank name" do
      res = FactoryBot.build(:code_resouce, name: " ")

      expect(res.validate).to be false
      expect(res.errors["name"].length).to be 1
    end

    it "allows very short names" do
      res = FactoryBot.build(:code_resouce, name: "a")

      expect(res.validate).to be true
    end
  end

  context "ast" do
    it "rejects nodes without a name" do
      res = FactoryBot.build(:code_resouce)
      res.ast = {
        "language" => "specLang"
      }

      expect(res.validate).to be false
      expect(res.errors["ast"].length).to be 1
    end

    it "rejects nodes without a language" do
      res = FactoryBot.build(:code_resouce)
      res.ast = {
        "name" => "specRoot"
      }

      expect(res.validate).to be false
      expect(res.errors["ast"].length).to be 1
    end

    it "accepts a missing root" do
      res = FactoryBot.build(:code_resouce)
      res.ast = nil

      expect(res.validate).to be true
    end
  end
end
