require 'rails_helper'
include GraphqlQueryHelper

RSpec.describe ProjectsController, type: :request do
  before(:each) { create(:user, :guest) }

  describe 'POST /api/project' do
    let(:user) { create(:user) }

    describe 'valid request' do
      it 'creates a project' do
        params = {"name" => { "en" => "Some project" }, "slug" => "test" }
        send_query(query_name:"CreateProject",variables:  params)

        expect(response.status).to eq(200)
        expect(response.media_type).to eq "application/json"

        created_project = Project.find_by(slug: "test")
        expect(created_project.name).to eq({ "en" => "Some project" })
        expect(created_project.slug).to eq "test"
        expect(File.directory?(created_project.data_directory_path)).to eq true

        expect(created_project.public).to eq false
      end

      it 'missing the slug' do
        params = {"name" => { "en" => "Some project" }}
        send_query(query_name:"CreateProject",variables:  params)

        expect(response).to have_http_status(200)
        expect(JSON.parse(response.body)["data"]["createProject"]["errors"]).to eq []
        expect(Project.all.length).to eq 1
      end
    end

    describe 'invalid request' do
      it 'missing a name' do
        params = { "slug": "foof" }
        send_query(query_name:"CreateProject",variables:  params)

        expect(response).to have_http_status(200)
        expect(JSON.parse(response.body)["errors"]).not_to eq []
      end
    end
  end

  describe 'PUT /api/project/:project_id' do
    let(:project) { create(:project, name: { "en" => "Some project" }, slug: 'test') }
    let(:update_params) {
      {
        "apiVersion" => 4,
        "name" => { "en" => "Hallo Test" },
        "description" => { "en" => "This is a test proejct" }
      }
    }

    it 'denies unauthenticated requests' do
      put "/api/project/#{project.slug}", params: update_params
      expect(response).to have_http_status(401)
    end

    describe 'valid request' do
      before(:each) { set_access_token(project.user) }

      it 'updates all attributes at once' do
        put "/api/project/#{project.slug}", params: update_params

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
            params: { "apiVersion" => 4, "name" => { "en" => "Only" } }

        # Ensure the response is well formed
        expect(response).to have_http_status(200)
        json_data = JSON.parse(response.body)
        expect(json_data).to validate_against "ProjectDescription"

        # Ensure the database has actually changed
        updated = Project.find_by(slug: project.slug)
        expect(updated.name).to eq({ "en" => "Only" })
        expect(updated.description).to eq project.description
      end

      it 'updates only the description' do
        put "/api/project/#{project.slug}",
            params: { "apiVersion" => 4, "description" => { "en" => "Only" } }

        # Ensure the response is well formed
        expect(response).to have_http_status(200)
        json_data = JSON.parse(response.body)
        expect(json_data).to validate_against "ProjectDescription"

        # Ensure the database has actually changed
        updated = Project.find_by(slug: project.slug)
        expect(updated.name).to eq project.name
        expect(updated.description).to eq({ "en" => "Only" })
      end

      it 'ignores unknown attributes' do
        put "/api/project/#{project.slug}",
            params: { "apiVersion" => 4, "will_never_exist" => "Only" }

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
            }

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
            }

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
            }

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
      send_query(query_name:"FrontpageListProjects")

      expect(response).to have_http_status(200)
      expect(JSON.parse(response.body)["data"]["projects"]["nodes"].length).to eq 0
    end

    it 'lists a single public project' do
      FactoryBot.create(:project, :public)
      send_query(query_name:"FrontpageListProjects")
      parsed = JSON.parse(response.body)["data"]["projects"]["nodes"]

      expect(response).to have_http_status(200)
      expect(parsed.length).to eq 1
      # validate_against "ProjectListDescription" does not work because of __typename fields
    end

    describe 'does not list private projects' do
      it 'returns 200' do
        FactoryBot.create(:project, :private)
        FactoryBot.create(:project, public: true)

        send_query(query_name:"FrontpageListProjects")
        json_data = JSON.parse(response.body)["data"]["projects"]["nodes"]

        expect(response).to have_http_status(200)
        expect(json_data.length).to eq 1
      end
    end
    it 'limit' do
      FactoryBot.create(:project, :public)
      FactoryBot.create(:project, :public)
      FactoryBot.create(:project, :public)

      send_query(query_name:"AdminListProjects", variables: {first: 1})
      expect(JSON.parse(response.body)["data"]["projects"]["nodes"].length).to eq 1

      send_query(query_name:"AdminListProjects", variables: {first: 2})
      expect(JSON.parse(response.body)["data"]["projects"]["nodes"].length).to eq 2

      send_query(query_name:"AdminListProjects", variables: {first: 3})
      expect(JSON.parse(response.body)["data"]["projects"]["nodes"].length).to eq 3

      send_query(query_name:"AdminListProjects", variables: {first: 4})
      expect(JSON.parse(response.body)["data"]["projects"]["nodes"].length).to eq 3
    end

    describe 'order by' do
      before do
        FactoryBot.create(:project, :public, name: {"de" => 'cccc'}, slug: 'cccc')
        FactoryBot.create(:project, :public, name: {"de" => 'aaaa'}, slug: 'aaaa')
        FactoryBot.create(:project, :public, name: {"de" => 'bbbb'}, slug: 'bbbb')
      end

      it 'nonexistant column' do
        send_query(query_name:"AdminListProjects", variables: {input: {order: {orderField: "nonexistant"}}})

        expect(response.status).to eq 200
        expect(JSON.parse(response.body)["errors"]).not_to eq []
      end

      it 'slug' do
        send_query(query_name:"AdminListProjects", variables: {input: {order: {orderField: "slug"}}})
        json_data = JSON.parse(response.body)["data"]["projects"]["nodes"]

        expect(json_data.map { |p| p['slug'] }).to eq ['aaaa', 'bbbb', 'cccc']
      end

      it 'slug invalid direction' do
        send_query(query_name:"AdminListProjects", variables: {input: {order: {orderField: "slug", orderDirection: "north"}}})

        expect(response.status).to eq 200
        expect(JSON.parse(response.body)["errors"]).not_to eq []
      end

      it 'slug desc' do
        send_query(query_name:"AdminListProjects", variables: {input: {order: {orderField: "slug", orderDirection: "desc"}}})
        json_data = JSON.parse(response.body)["data"]["projects"]["nodes"]

        expect(json_data.map { |p| p['slug'] }).to eq ['cccc', 'bbbb', 'aaaa']
      end

      it 'slug asc' do
        send_query(query_name:"AdminListProjects", variables: {input: {order: {orderField: "slug", orderDirection: "asc"}}})
        json_data = JSON.parse(response.body)["data"]["projects"]["nodes"]

        expect(json_data.map { |p| p['slug'] }).to eq ['aaaa', 'bbbb', 'cccc']
      end

      it 'name desc' do
        send_query(query_name:"AdminListProjects", variables: {input: {order: {orderField: "name", orderDirection: "desc"}}})
        json_data = JSON.parse(response.body)["data"]["projects"]["nodes"]

        expect(json_data.map { |p| p['name'] }).to eq [{"de"=>"cccc"}, {"de"=>"bbbb"}, {"de"=>"aaaa"}]
      end

      it 'name asc' do
        send_query(query_name:"AdminListProjects", variables: {input: {order: {orderField: "name", orderDirection: "asc"}}})
        json_data = JSON.parse(response.body)["data"]["projects"]["nodes"]

        expect(json_data.map { |p| p['name'] }).to eq [{"de"=>"aaaa"}, {"de"=>"bbbb"}, {"de"=>"cccc"}]
      end
    end
  end
  describe 'GET /api/project/:project_id' do
    it 'empty project satisfies the JSON schema' do
      empty_project = FactoryBot.create(:project)
      send_query(query_name:"FullProject",variables: {id: empty_project.id})

      expect(response).to have_http_status(200)
      expect(JSON.parse(response.body)["data"]["projects"]["nodes"][0]["slug"]).to eq empty_project.slug
      # validate_against "ProjectFullDescription" does not work because of __typename fields
    end

    it 'responds with 200 for non existing projects' do
      send_query(query_name:"FullProject",variables: {id: "00000000-0000-0000-0000-000000000001"})
      expect(response).to have_http_status(200)
      expect(JSON.parse(response.body)["data"]["projects"]["nodes"]).to eq []
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
      delete "/api/project/not_even_a_uuid"

      expect(response).to have_http_status(404)
    end

    it 'an empty project' do
      to_delete = FactoryBot.create(:project)
      set_access_token(to_delete.user)

      delete "/api/project/#{to_delete.slug}"

      expect(response.body).to be_empty
      expect(response).to have_http_status(204)

      expect(Project.exists?(to_delete.id)).to be false
    end
  end

  def uuid
    SecureRandom.uuid
  end
end
