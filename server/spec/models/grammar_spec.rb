require 'rails_helper'

RSpec.describe Grammar, type: :model do
  context "name" do
    it "rejects an missing name" do
      res = FactoryBot.build(:grammar, name: nil)

      res.validate
      expect(res.errors["name"].length).to be 1
    end
  end

  context "model" do
    it "rejects missing root and missing types" do
      res = FactoryBot.build(:grammar, model: Hash.new)

      res.validate
      expect(res.errors["model"].length).to be 2
    end

    it "factory created" do
      res = FactoryBot.build(:grammar)

      res.validate
      expect(res.errors["model"].length).to be 0
    end
  end
end
