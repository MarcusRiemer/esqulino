require 'rails_helper'

RSpec.describe ProjectsController, type: :request do
  before(:each) { create(:user, :guest) }

  describe 'GraphQL FullProject' do
    it 'finds a project by id' do
      p = create(:project)

      data = send_query(
        query_name: "FullProject",
        variables: { "id" => p.id }
      )

      node = data["data"]["project"];
      expect(node["id"]).to eq p.id
    end

    it 'finds a project by slug' do
      p = create(:project, slug: "uniq")

      data = send_query(
        query_name: "FullProject",
        variables: { "id" => p.slug }
      )

      node = data["data"]["project"];
      expect(node["id"]).to eq p.id
    end

    it 'project with database schema (no foreign keys)' do
      # This previously crashed because of a bug with the schema visualization
      db = create(:project_database, :table_key_value)
      p = db.project

      data = send_query(
        query_name: "FullProject",
        variables: { "id" => p.id }
      )

      node = data["data"]["project"];
      expect(node["id"]).to eq p.id
    end

    it 'project with database schema (with foreign keys)' do
      # This previously crashed because of a bug with the schema visualization
      db = create(:project_database, :tables_references)
      p = db.project

      data = send_query(
        query_name: "FullProject",
        variables: { "id" => p.id }
      )

      node = data["data"]["project"];
      expect(node["id"]).to eq p.id
    end
  end

  describe 'GraphQL CreateProject' do
    let(:user) { create(:user) }

    describe 'valid request' do
      it 'creates a project' do
        set_access_token(user)
        data = send_query(
          query_name: "CreateProject",
          variables: { "name" => { "en" => "Some project" }, "slug" => "test" }
        )

        created_project = Project.find_by(slug: "test")
        expect(created_project.name).to eq({ "en" => "Some project" })
        expect(created_project.slug).to eq "test"
        expect(File.directory?(created_project.data_directory_path)).to eq true

        expect(created_project.public).to eq false
      end

      it 'missing the slug' do
        set_access_token(user)
        json_body = send_query(
          query_name: "CreateProject",
          variables: { "name" => { "en" => "Some project" }, "slug" => "test" },
          expect_no_errors: false,

        )

        expect(json_body["data"]["createProject"].fetch("errors", [])).to eq []

        expect(Project.all.length).to eq 1
      end
    end

    describe 'invalid request' do
      it 'missing a name' do
        set_access_token(user)
        json_body = send_query(
          query_name: "CreateProject",
          variables: { "slug" => "test" },
          expect_no_errors: false,
        )

        expect(json_body.fetch("errors", []).length).to eq 1

        expect(Project.all.length).to eq 0
      end
    end
  end

  describe 'GraphQL UpdateProject' do
    let(:project) { create(:project, name: { "en" => "Some project" }, slug: 'test') }
    let(:update_params) {
      {
        "id" => project.id,
        "name" => { "en" => "Hallo Test" },
        "description" => { "en" => "This is a test project" }
      }
    }

    it 'denies unauthenticated requests' do
      json_body = send_query(
        query_name: "UpdateProject",
        variables: update_params,
        expect_no_errors: false,
      )

      expect(json_body.fetch("errors", []).length).to eq 1

      project.reload
      expect(project.name).to eq({ "en" => "Some project" })

    end

    describe 'valid request' do
      before(:each) { set_access_token(project.user) }

      it 'updates name and description' do
        send_query(
          query_name: "UpdateProject",
          variables: update_params
        )

        # Ensure the response is well formed
        expect(response).to have_http_status(200)
        expect(response.media_type).to eq "application/json"
        json_body = JSON.parse(response.body)
        expect(json_body.fetch("errors", [])).to eq []

        # Ensure the database has actually changed
        updated = Project.find_by(slug: project.slug)
        expect(updated.name).to eq update_params['name']
        expect(updated.description).to eq update_params['description']
      end

      it 'updates only the name' do
        send_query(
          query_name: "UpdateProject",
          variables: {
            "id" => project.id,
            "name" => { "en" => "Only" }
          }
        )

        # Ensure the response is well formed
        expect(response).to have_http_status(200)
        expect(response.media_type).to eq "application/json"
        json_body = JSON.parse(response.body)
        expect(json_body.fetch("errors", [])).to eq []

        # Ensure the database has actually changed
        updated = Project.find_by(slug: project.slug)
        expect(updated.name).to eq({ "en" => "Only" })
        expect(updated.description).to eq project.description
      end

      it 'update with empty name' do
        pending("What exactly does an empty LangJson field mean for an update?")

        send_query(
          query_name: "UpdateProject",
          variables: {
            "id" => project.id,
            "name" => {}
          }
        )

        # Ensure the response is well formed
        expect(response).to have_http_status(200)
        expect(response.media_type).to eq "application/json"
        json_body = JSON.parse(response.body)
        expect(json_body.fetch("errors", [])).to eq []

        # Should the project remain unchanged or should the name now be empty?
        updated = Project.find_by(slug: project.slug)
        expect(updated.name).to eq({ "en" => "Only" })
        expect(updated.description).to eq project.description
      end

      it 'updates the name in two languages' do
        send_query(
          query_name: "UpdateProject",
          variables: {
            "id" => project.id,
            "name" => { "en" => "Only", "de" => "Einzig" }
          }
        )

        # Ensure the response is well formed
        expect(response).to have_http_status(200)
        expect(response.media_type).to eq "application/json"
        json_body = JSON.parse(response.body)
        expect(json_body.fetch("errors", [])).to eq []

        # Ensure the database has actually changed
        updated = Project.find_by(slug: project.slug)
        expect(updated.name).to eq({ "en" => "Only", "de" => "Einzig" })
        expect(updated.description).to eq project.description
      end

      it 'updates only the description' do
        send_query(
          query_name: "UpdateProject",
          variables: {
            "id" => project.id,
            "description" => { "en" => "Only" }
          }
        )

        # Ensure the response is well formed
        expect(response).to have_http_status(200)
        expect(response.media_type).to eq "application/json"
        json_body = JSON.parse(response.body)
        expect(json_body.fetch("errors", [])).to eq []

        # Ensure the database has actually changed
        updated = Project.find_by(slug: project.slug)
        expect(updated.name).to eq project.name
        expect(updated.description).to eq({ "en" => "Only" })
      end

      it 'filters unknown attributes' do
        send_query(
          query_name: "UpdateProject",
          variables: {
            "id" => project.id,
            "name" => { "en" => "Only" },
            "description" => { "en" => "Only" },
            "will_never_exist" => { "en" => "Only" }
          }
        )

        # Ensure the response is well formed
        expect(response).to have_http_status(200)
        json_data = JSON.parse(response.body)

        # Ensure the database hasn't actually changed
        updated = Project.find_by(slug: project.slug)
        expect(updated.name).to eq ({ "en" => "Only" })
        expect(updated.description).to eq ({ "en" => "Only" })
      end
    end
  end

  describe "GraphQL Project BlockLanguage Mutations" do
    let(:user) { create(:user) }
    let(:project) { create(:project, user: user) }

    before(:each) { set_access_token(project.user) }

    it 'adds new used block languages' do
      # The project has already a block language that is in use
      added_block_language = FactoryBot.create(:block_language)
      project.project_uses_block_languages.create(block_language: added_block_language)

      # The block language to add
      new_block_language = FactoryBot.create(:block_language)

      send_query(
        query_name: "ProjectAddUsedBlockLanguage",
        variables: {
          projectId: project.id,
          blockLanguageId: new_block_language.id
        }
      )

      expect(response.status).to eq(200)
      expect(response.media_type).to eq "application/json"

      json_body = JSON.parse(response.body)
      expect(json_body["errors"]).to eq nil

      # Ensure the database has actually changed
      project.reload
      expect(project.project_uses_block_languages.size).to eq 2
      expect(project.block_languages.include? new_block_language).to be true
    end

    it 'removes used block languages' do
      b = FactoryBot.create(:block_language)
      used = project.project_uses_block_languages.create(block_language: b)

      send_query(
        query_name: "ProjectRemoveUsedBlockLanguage",
        variables: {
          usedBlockLanguageId: used.id
        }
      )

      expect(response.status).to eq(200)
      expect(response.media_type).to eq "application/json"

      json_body = JSON.parse(response.body)
      expect(json_body["errors"]).to eq nil

      # Ensure the database has actually changed
      project.reload
      expect(project.project_uses_block_languages.size).to eq 0
      expect(BlockLanguage.count).to eq 1
    end
  end

  describe 'GraphQL FrontpageListProjects' do
    it 'lists nothing if nothing is there' do
      send_query(query_name: "FrontpageListProjects")

      expect(response).to have_http_status(200)
      parsed = JSON.parse(response.body)
      expect(parsed['data']['projects']['nodes'].length).to eq 0
    end

    it 'lists a single public project' do
      FactoryBot.create(:project, :public)

      send_query(query_name: "FrontpageListProjects")

      expect(response).to have_http_status(200)

      expect(response).to have_http_status(200)
      parsed = JSON.parse(response.body)
      expect(parsed['data']['projects']['nodes'].length).to eq 1
    end

    it 'does not list private projects' do
      FactoryBot.create(:project, :private)
      FactoryBot.create(:project, :public)

      send_query(query_name: "FrontpageListProjects")

      expect(response).to have_http_status(200)
      parsed = JSON.parse(response.body)
      expect(parsed['data']['projects']['nodes'].length).to eq 1
    end
  end

  describe 'GraphQL AdminListProjects' do
    it 'guest user: not permitted' do
      send_query(
        query_name: "AdminListProjects",
        exp_http_status: 401
      )
    end

    it 'ordinary user: not permitted' do
      user = create(:user)
      set_access_token(user)

      send_query(
        query_name: "AdminListProjects",
        exp_http_status: 401
      )
    end

    it 'admin user: permitted' do
      FactoryBot.create(:project, :public, name: { "de" => 'cccc' }, slug: 'cccc')
      FactoryBot.create(:project, :public, name: { "de" => 'aaaa' }, slug: 'aaaa')
      FactoryBot.create(:project, :public, name: { "de" => 'bbbb' }, slug: 'bbbb')

      user = create(:user, :admin)
      set_access_token(user)

      send_query(query_name: "AdminListProjects")

      expect(response).to have_http_status(200)
      parsed = JSON.parse(response.body)
      expect(parsed['data']['projects']['nodes'].length).to eq 3
    end
  end

  describe 'GraphQL DestroyProject' do
    it 'unauthorized' do
      p = create(:project)

      send_query(
        query_name: "DestroyProject",
        variables: { "id" => p.id },
        expect_no_errors: false,
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
        variables: { "id" => "11ceddb1-951b-40dc-bf60-fcfbcdaddc65" },
        expect_no_errors: false,
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

  describe 'GET /api/project/:project_id/preview' do
    it 'project without an image' do
      empty_project = FactoryBot.create(:project)
      get "/api/project/#{empty_project.slug}/preview"

      expect(response).to have_http_status(404)
    end
  end

  def uuid
    SecureRandom.uuid
  end
end
