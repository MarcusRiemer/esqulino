require 'rails_helper'
require 'fakefs/safe'

RSpec.describe ProjectsController, type: :request do

  let(:auth_headers) { {"Authorization" => "Basic #{Base64.encode64('user:user')}"} }

  describe 'POST /api/project' do

    describe 'valid request' do
      it 'creates a project', fakefs: true do
        fakefs_clone_projects_dir!

        post '/api/project', params: {"name" => "Some project", "slug" => "test" }

        expect(response.status).to eq(200)
        expect(response.content_type).to eq "application/json"

        created_project = Project.find_by(slug: "test")
        expect(created_project.name).to eq "Some project"
        expect(created_project.slug).to eq "test"
        expect(File.directory?(created_project.data_directory_path)).to eq true

        skip "Projects should not be public by default"
        expect(created_project.public).to eq false
      end
    end

    describe 'invalid request' do
      it 'missing a name' do
        post '/api/project', params: { "slug": "foof" }
        expect(response).to have_http_status(400)
      end

      it 'missing the slug' do
        post '/api/project', params: { "name": "foof" }
        expect(response).to have_http_status(400)
      end
    end
  end

  describe 'PUT /api/project/:project_id' do
    let(:project) { create(:project, name: 'Test', slug: 'test') }
    let(:update_params) {
      {
        "apiVersion" => 4,
        "name" => "Hello Test",
        "description" => "This is a test proejct"
      }
    }

    it 'denies unauthenticated requests' do
      put "/api/project/#{project.slug}", params: update_params
      expect(response).to have_http_status(401)
    end

    describe 'valid request' do
      it 'updates all attributes at once' do
        put "/api/project/#{project.slug}", params: update_params, headers: auth_headers

        # Ensure the response is well formed
        expect(response).to have_http_status(200)
        json_data = JSON.parse(response.body)
        expect(json_data).to validate_against "ProjectDescription"

        # Ensure the database has actually changed
        updated = Project.find_by(slug: project.slug)
        expect(updated.name).to eq update_params['name']
        expect(updated.description).to eq update_params['description']
      end

      it 'updates only the name' do
        put "/api/project/#{project.slug}",
            params: { "apiVersion" => 4, "name" => "Only" },
            headers: auth_headers

        # Ensure the response is well formed
        expect(response).to have_http_status(200)
        json_data = JSON.parse(response.body)
        expect(json_data).to validate_against "ProjectDescription"

        # Ensure the database has actually changed
        updated = Project.find_by(slug: project.slug)
        expect(updated.name).to eq "Only"
        expect(updated.description).to eq project.description
      end

      it 'updates only the description' do
        put "/api/project/#{project.slug}",
            params: { "apiVersion" => 4, "description" => "Only" },
            headers: auth_headers

        # Ensure the response is well formed
        expect(response).to have_http_status(200)
        json_data = JSON.parse(response.body)
        expect(json_data).to validate_against "ProjectDescription"

        # Ensure the database has actually changed
        updated = Project.find_by(slug: project.slug)
        expect(updated.name).to eq project.name
        expect(updated.description).to eq "Only"
      end

      it 'ignores unknown attributes' do
        put "/api/project/#{project.slug}",
            params: { "apiVersion" => 4, "will_never_exist" => "Only" },
            headers: auth_headers

        # Ensure the response is well formed
        expect(response).to have_http_status(200)
        json_data = JSON.parse(response.body)
        expect(json_data).to validate_against "ProjectDescription"

        # Ensure the database has actually changed
        updated = Project.find_by(slug: project.slug)
        expect(updated.name).to eq project.name
        expect(updated.description).to eq project.description
      end

      it 'adds new used block languages' do
        added_block_language = FactoryBot.create(:block_language)
        new_block_language = FactoryBot.create(:block_language)
        project.project_uses_block_languages.create(block_language: added_block_language)

        put "/api/project/#{project.slug}",
            params: {
              "apiVersion" => 4,
              "projectUsesBlockLanguages" => [
                { "blockLanguageId" => new_block_language.id }
              ]
            },
            headers: auth_headers

        # Ensure the response is well formed
        expect(response).to have_http_status(200)
        json_data = JSON.parse(response.body)
        expect(json_data).to validate_against "ProjectDescription"

        # Ensure the database has actually changed
        project.reload
        expect(project.project_uses_block_languages.size).to eq 2
        expect(project.block_languages.include? new_block_language).to be true
      end

      it 'removes used block languages' do
        added_block_language = FactoryBot.create(:block_language)
        use_added_block_language = project.project_uses_block_languages.create(block_language: added_block_language)

        put "/api/project/#{project.slug}",
            params: {
              "apiVersion" => 4,
              "projectUsesBlockLanguages" => [
                { "id" => use_added_block_language.id, "_destroy": true }
              ]
            },
            headers: auth_headers

        # Ensure the response is well formed
        expect(response).to have_http_status(200)
        json_data = JSON.parse(response.body)
        expect(json_data).to validate_against "ProjectDescription"

        # Ensure the database has actually changed
        project.reload
        expect(project.project_uses_block_languages.size).to eq 0
      end

      it 'updates used block languages' do
        added_block_language = FactoryBot.create(:block_language)
        use_added_block_language = project.project_uses_block_languages.create(block_language: added_block_language)
        new_block_language = FactoryBot.create(:block_language)

        put "/api/project/#{project.slug}",
            params: {
              "apiVersion" => 4,
              "projectUsesBlockLanguages" => [
                { "id" => use_added_block_language.id, "blockLanguageId": new_block_language.id }
              ]
            },
            headers: auth_headers

        # Ensure the response is well formed
        expect(response).to have_http_status(200)
        json_data = JSON.parse(response.body)
        expect(json_data).to validate_against "ProjectDescription"

        # Ensure the database has actually changed
        project.reload
        expect(project.project_uses_block_languages.size).to eq 1
        expect(project.block_languages.include? new_block_language).to be true
      end
    end
  end

  describe 'GET /api/project/' do
    it 'lists nothing if nothing is there' do
      get "/api/project/"

      expect(response).to have_http_status(200)
      expect(JSON.parse(response.body).length).to eq 0
    end

    it 'lists a single public project' do
      FactoryBot.create(:project, :public, api_version: "4")
      get "/api/project/"

      expect(response).to have_http_status(200)

      json_data = JSON.parse(response.body)

      expect(json_data.length).to eq 1

      expect(json_data[0]).to validate_against "ProjectListDescription"
    end

    describe 'does not list private projects' do
      before do
        FactoryBot.create(:project, :private)
        FactoryBot.create(:project, api_version: 4, public: true)
        get "/api/project/"
        @json_data = JSON.parse(response.body)
      end

      it 'returns 200' do
        expect(response).to have_http_status(200)
        expect(@json_data.length).to eq 1
      end

      it 'validates against json schema' do
        expect(@json_data[0]).to validate_against "ProjectListDescription"
      end
    end
  end

  describe 'GET /api/project/:project_id' do
    it 'empty project satisfies the JSON schema' do
      empty_project = FactoryBot.create(:project)
      get "/api/project/#{empty_project.slug}"

      expect(response).to have_http_status(200)
      expect(JSON.parse(response.body)).to validate_against "ProjectFullDescription"
    end

    it 'responds with 404 for non existing projects' do
      get "/api/project/0"
      expect(response).to have_http_status(404)
    end
  end

  describe 'GET /api/project/:project_id/preview' do
    it 'project without an image' do
      empty_project = FactoryBot.create(:project)
      get "/api/project/#{empty_project.slug}/preview"

      expect(response).to have_http_status(404)
    end
  end

  describe 'DELETE /api/project/:project_id' do
    it 'unauthorized' do
      to_delete = FactoryBot.create(:project)
      delete "/api/project/#{to_delete.slug}"

      expect(response).to have_http_status(401)

      expect(Project.exists?(to_delete.id)).to be true
    end

    it 'nonexistant' do
      delete "/api/project/not_even_a_uuid", headers: auth_headers

      expect(response).to have_http_status(404)
    end

    it 'an empty project' do
      to_delete = FactoryBot.create(:project)

      delete "/api/project/#{to_delete.slug}", headers: auth_headers

      expect(response.body).to be_empty
      expect(response).to have_http_status(204)

      expect(Project.exists?(to_delete.id)).to be false
    end
  end

  def uuid
    SecureRandom.uuid
  end
end
