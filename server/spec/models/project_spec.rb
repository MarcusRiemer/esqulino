require 'rails_helper'

RSpec.describe Project do
  context "slug" do
    it "allows empty slugs" do
      res = FactoryBot.build(:project, slug: nil)
      expect(res.valid?).to be true
    end

    it "allows valid slugs" do
      ["aa", "ab", "a1", "a_b", "a-b"].each do |s|
        res = FactoryBot.build(:project, slug: s)
        expect(res.errors["slug"]).to eq([])
      end
    end

    it "rejects slugs that are too short" do
      res = FactoryBot.build(:project, slug: "")

      res.validate
      expect(res.errors["slug"].length).to eq 1
    end

    it "stores two projects with empty slugs" do
      p1 = FactoryBot.create(:project, slug: nil)
      p2 = FactoryBot.create(:project, slug: nil)

      expect(Project.all.count).to eq 2
      expect(Project.where(slug: nil).count).to be 2
    end
  end

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
      expect(api_response['grammars'][0]).to eq proj.grammars[0].to_full_api_response
    end

    it "doesn't list grammars or block languages multiple times" do
      proj = FactoryBot.create(:project, name: "Test")

      g = FactoryBot.create(:grammar)

      # Two block languages with the same grammar
      b1 = FactoryBot.create(:block_language, name: "Test Blocklang 1", grammar: g)
      proj.project_uses_block_languages.create!(block_language: b1)

      b2 = FactoryBot.create(:block_language, name: "Test Blocklang 2", grammar: g)
      proj.project_uses_block_languages.create!(block_language: b2)

      # Multiple resources that use these block languages
      FactoryBot.create(:code_resource, project: proj, block_language: b1)
      FactoryBot.create(:code_resource, project: proj, block_language: b1)
      FactoryBot.create(:code_resource, project: proj, block_language: b2)
      FactoryBot.create(:code_resource, project: proj, block_language: b2)

      api_response = proj.to_project_api_response
      expect(api_response).to validate_against "ProjectDescription"
      expect(api_response['grammars'].length).to eq 1
      expect(api_response['blockLanguages'].length).to eq 2
    end

  end

  context "directories" do
    it "end with the UUID" do
      p = FactoryBot.build(:project, id: SecureRandom.uuid)
      expect(p.data_directory_path).to end_with(p.id)
    end
  end

  it "prints a readable identification" do
    res = FactoryBot.create(:project, slug: "sluggy")
    readable = res.readable_identification
    expect(readable).to include res.id
    expect(readable).to include res.name
    expect(readable).to include res.slug
  end
end
