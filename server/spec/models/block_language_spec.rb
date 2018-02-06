require 'rails_helper'

RSpec.describe BlockLanguage do
  context "name" do
    it "rejects an missing name" do
      res = FactoryBot.build(:block_language, name: nil)

      res.validate
      expect(res.errors["name"].length).to be 1
    end
  end

  context "model" do
    it "rejects missing block lists" do
      res = FactoryBot.build(:block_language, model: Hash.new)

      res.validate
      expect(res.errors["model"].length).to be 2
    end
  end

  it "can be valid" do
    res = FactoryBot.build(:block_language)

    expect(res.valid?).to be true
  end
end
