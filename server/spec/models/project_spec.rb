require 'rails_helper'

RSpec.describe Project do
  context "to_full_api_response" do
    it "without resources" do
      api_response = FactoryBot.create(:project, name: "Test").to_full_api_response

      expect(api_response).to validate_against "ProjectDescription"
    end

    it "with resources that use the same block language" do
      proj = FactoryBot.create(:project, name: "Test Project")
      b = FactoryBot.create(:block_language, name: "Test Blocklang")
      proj.block_languages << b
      
      p = FactoryBot.create(:programming_language)
      proj.code_resources.create!(name: "Res 1", programming_language: p, block_language: b)
      proj.code_resources.create!(name: "Res 2", programming_language: p, block_language: b)

      api_response = proj.to_full_api_response

      expect(api_response).to validate_against "ProjectDescription"
    end
  end
end
