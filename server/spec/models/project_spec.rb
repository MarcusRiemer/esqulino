require 'rails_helper'

RSpec.describe Project do
  context "find_by_slug_or_id!" do
    it "existing slug" do
      p1 = FactoryBot.create(:project, slug: "test")
      p2 = FactoryBot.create(:project, slug: "test2")
      p = Project.find_by_slug_or_id! p1.slug

      expect(p1.id).to eq(p.id)
    end

    it "existing slug" do
      p1 = FactoryBot.create(:project, slug: "test")
      p2 = FactoryBot.create(:project, slug: "test2")
      p = Project.find_by_slug_or_id! p1.id

      expect(p1.id).to eq(p.id)
    end
  end

  context "to_full_api_response" do
    it "without resources" do
      api_response = FactoryBot.create(:project, name: "Test").to_full_api_response

      expect(api_response).to validate_against "ProjectFullDescription"
    end

    it "with resources that use the same block language" do
      proj = FactoryBot.create(:project, name: "Test Project")
      b = FactoryBot.create(:block_language, name: "Test Blocklang")
      proj.block_languages << b

      p = FactoryBot.create(:programming_language)
      proj.code_resources.create!(name: "Res 1", programming_language: p, block_language: b)
      proj.code_resources.create!(name: "Res 2", programming_language: p, block_language: b)

      api_response = proj.to_full_api_response

      expect(api_response).to validate_against "ProjectFullDescription"
    end
  end

  context "to_project_api_response" do
    it "empty project" do
      api_response = FactoryBot.create(:project, name: "Test").to_project_api_response

      expect(api_response).to validate_against "ProjectDescription"
    end

    it "project with source and used block language" do
      proj = FactoryBot.create(:project, name: "Test")
      proj.project_sources << FactoryBot.create(:project_source, project: proj)

      b = FactoryBot.create(:block_language, name: "Test Blocklang")
      proj.project_uses_block_languages.create!(block_language: b)

      api_response = proj.to_project_api_response
      expect(api_response).to validate_against "ProjectDescription"
      expect(api_response['sources'][0]).to eq proj.project_sources[0].to_full_api_response
      expect(api_response['projectUsesBlockLanguages'][0]).to eq proj.project_uses_block_languages[0].to_api_response
    end
  end

  context "directories" do
    it "end with the UUID" do
      p = FactoryBot.build(:project, id: SecureRandom.uuid)
      expect(p.data_directory_path).to end_with(p.id)
    end
  end
end
