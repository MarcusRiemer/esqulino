require 'rails_helper'

RSpec.describe ProjectsController, type: :request do
  before(:each) { create(:user, :guest) }

  describe 'GraphQL FullProject' do
    it 'finds a project by id' do
      p = create(:project)

      send_query(
        query_name: "FullProject",
        variables: { "id" => p.id}
      )

      expect(response.status).to eq 200
      expect(response.media_type).to eq "application/json"
      data = JSON.parse(response.body)
      expect(data.fetch("errors", [])).to eq []

      node = data["data"]["projects"]["nodes"][0];
      expect(node["id"]).to eq p.id
    end

    it 'finds a project by slug' do
      p = create(:project, slug: "uniq")

      send_query(
        query_name: "FullProject",
        variables: { "id" => p.slug}
      )

      expect(response.status).to eq 200
      expect(response.media_type).to eq "application/json"
      data = JSON.parse(response.body)
      expect(data.fetch("errors", [])).to eq []

      node = data["data"]["projects"]["nodes"][0];
      expect(node["id"]).to eq p.id
    end
  end

  describe 'POST /api/project' do
    let(:user) { create(:user) }

    describe 'valid request' do
      it 'creates a project' do
        set_access_token(user)
        send_query(
          query_name: "CreateProject",
          variables: {"name" => { "en" => "Some project" }, "slug" => "test" }
        )

        expect(response.status).to eq(200)
        expect(response.media_type).to eq "application/json"

        json_body = JSON.parse(response.body)
        expect(json_body["data"]["createProject"].fetch("errors", [])).to eq []

        created_project = Project.find_by(slug: "test")
        expect(created_project.name).to eq({ "en" => "Some project" })
        expect(created_project.slug).to eq "test"
        expect(File.directory?(created_project.data_directory_path)).to eq true

        expect(created_project.public).to eq false
      end

      it 'missing the slug' do
        set_access_token(user)
        send_query(
          query_name: "CreateProject",
          variables: {"name" => { "en" => "Some project" }, "slug" => "test" }
        )

        expect(response.status).to eq(200)
        expect(response.media_type).to eq "application/json"

        json_body = JSON.parse(response.body)
        expect(json_body["data"]["createProject"].fetch("errors", [])).to eq []

        expect(Project.all.length).to eq 1
      end
    end

    describe 'invalid request' do
      it 'missing a name' do
        set_access_token(user)
        send_query(
          query_name: "CreateProject",
          variables: { "slug" => "test" }
        )

        expect(response.status).to eq(200)
        expect(response.media_type).to eq "application/json"

        json_body = JSON.parse(response.body)
        expect(json_body.fetch("errors", []).length).to eq 1

        expect(Project.all.length).to eq 0
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
      get "/api/project/"

      expect(response).to have_http_status(200)
      parsed = JSON.parse(response.body)
      expect(parsed['data'].length).to eq 0
    end

    it 'lists a single public project' do
      FactoryBot.create(:project, :public)
      get "/api/project/"

      expect(response).to have_http_status(200)

      parsed = JSON.parse(response.body)
      expect(parsed['data'].length).to eq 1
      expect(parsed['data'][0]).to validate_against "ProjectListDescription"
    end

    describe 'does not list private projects' do
      before do
        FactoryBot.create(:project, :private)
        FactoryBot.create(:project, public: true)
        get "/api/project/"
        @json_data = JSON.parse(response.body)['data']
      end

      it 'returns 200' do
        expect(response).to have_http_status(200)
        expect(@json_data.length).to eq 1
      end

      it 'validates against json schema' do
        expect(@json_data[0]).to validate_against "ProjectListDescription"
      end
    end

    it 'limit' do
      FactoryBot.create(:project, :public)
      FactoryBot.create(:project, :public)
      FactoryBot.create(:project, :public)

      get "/api/project?limit=1"
      expect(JSON.parse(response.body)['data'].length).to eq 1

      get "/api/project?limit=2"
      expect(JSON.parse(response.body)['data'].length).to eq 2

      get "/api/project?limit=3"
      expect(JSON.parse(response.body)['data'].length).to eq 3

      get "/api/project?limit=4"
      expect(JSON.parse(response.body)['data'].length).to eq 3
    end

    describe 'order by' do
      before do
        FactoryBot.create(:project, :public, name: {"de" => 'cccc'}, slug: 'cccc')
        FactoryBot.create(:project, :public, name: {"de" => 'aaaa'}, slug: 'aaaa')
        FactoryBot.create(:project, :public, name: {"de" => 'bbbb'}, slug: 'bbbb')
      end

      it 'nonexistant column' do
        get "/api/project?orderField=nonexistant"

        expect(response.status).to eq 400
      end

      it 'slug' do
        get "/api/project?orderField=slug"
        json_data = JSON.parse(response.body)['data']

        expect(json_data.map { |p| p['slug'] }).to eq ['aaaa', 'bbbb', 'cccc']
      end

      it 'slug invalid direction' do
        get "/api/project?orderField=slug&orderDirection=north"

        expect(response.status).to eq 400
      end

      it 'slug desc' do
        get "/api/project?orderField=slug&orderDirection=desc"
        json_data = JSON.parse(response.body)['data']

        expect(json_data.map { |p| p['slug'] }).to eq ['cccc', 'bbbb', 'aaaa']
      end

      it 'slug asc' do
        get "/api/project?orderField=slug&orderDirection=asc"
        json_data = JSON.parse(response.body)['data']

        expect(json_data.map { |p| p['slug'] }).to eq ['aaaa', 'bbbb', 'cccc']
      end

      it 'name desc' do
        get "/api/project?orderField=name&orderDirection=desc"
        json_data = JSON.parse(response.body)['data']

        expect(json_data.map { |p| p['name'] }).to eq [{"de"=>"cccc"}, {"de"=>"bbbb"}, {"de"=>"aaaa"}]
      end

      it 'name asc' do
        get "/api/project?orderField=name&orderDirection=asc"
        json_data = JSON.parse(response.body)['data']

        expect(json_data.map { |p| p['name'] }).to eq [{"de"=>"aaaa"}, {"de"=>"bbbb"}, {"de"=>"cccc"}]
      end
    end
  end

  describe 'GET /api/project/list_admin' do
    it 'guest user: not permitted' do
      get "/api/project/list_admin"

      expect(response).to have_http_status(403)
    end

    it 'ordinary user: not permitted' do
      user = create(:user)
      set_access_token(user)

      get "/api/project/list_admin"

      expect(response).to have_http_status(403)
    end

    it 'admin user: properly paginated' do
      FactoryBot.create(:project, :public, name: {"de" => 'cccc'}, slug: 'cccc')
      FactoryBot.create(:project, :public, name: {"de" => 'aaaa'}, slug: 'aaaa')
      FactoryBot.create(:project, :public, name: {"de" => 'bbbb'}, slug: 'bbbb')

      user = create(:user, :admin)
      set_access_token(user)

      get "/api/project/list_admin?orderField=slug&orderDirection=desc"

      expect(response).to have_http_status(200)
      json_data = JSON.parse(response.body)['data']

      expect(json_data.map { |p| p['slug'] }).to eq ['cccc', 'bbbb', 'aaaa']
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
      p = create(:project)

      send_query(
        query_name: "DestroyProject",
        variables: { "id" => p.id}
      )

      expect(response).to have_http_status(200)

      json_body = JSON.parse(response.body)
      expect(json_body["data"]["destroyProject"]["errors"].length).to eq 1

      # Must still exist
      expect(Project.exists?(p.id)).to be true
    end

    it 'nonexistant' do
      send_query(
        query_name: "DestroyProject",
        variables: { "id" => "11ceddb1-951b-40dc-bf60-fcfbcdaddc65" }
      )

      expect(response).to have_http_status(200)
      json_body = JSON.parse(response.body)
      expect(json_body["data"]["destroyProject"]["errors"].length).to eq 1
    end

    it 'an empty project' do
      to_delete = FactoryBot.create(:project)
      set_access_token(to_delete.user)

      send_query(
        query_name: "DestroyProject",
        variables: { "id" => to_delete.id }
      )

      expect(response).to have_http_status(200)

      json_body = JSON.parse(response.body)
      expect(json_body["data"]["destroyProject"].fetch("errors", [])).to eq []

      # Mustn't exist anymore
      expect(Project.exists?(to_delete.id)).to be false
    end
  end

  def uuid
    SecureRandom.uuid
  end
end
