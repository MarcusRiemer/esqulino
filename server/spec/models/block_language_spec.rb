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
    it "rejects missing block, sidebar and component lists" do
      res = FactoryBot.build(:block_language, model: Hash.new)

      res.validate
      expect(res.errors["model"].length).to be 3
    end
  end

  context "slug" do
    it "allows missing slugs" do
      res = FactoryBot.build(:block_language, slug: nil)
      expect(res.valid?).to be true
    end

    it "rejects duplicate slugs" do
      res_1 = FactoryBot.create(:block_language, slug: "dup")
      res_2 = FactoryBot.build(:block_language, slug: "dup")

      res_2.validate
      expect(res_2.errors["slug"].length).to be 1
    end
  end

  context "to_full_api_response" do
    it "works for empty languages" do
      b = FactoryBot.build(:block_language, id: SecureRandom.uuid)
      api_response = b.to_full_api_response

      expect(api_response).to validate_against "BlockLanguageDescription"
      expect(api_response['id']).to eq b.id
      expect(api_response['name']).to eq b.name
      expect(api_response['slug']).to eq b.slug
    end
  end

  it "can be valid" do
    res = FactoryBot.build(:block_language)
    expect(res.valid?).to be true
  end
end
