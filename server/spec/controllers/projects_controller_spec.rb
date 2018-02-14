require 'rails_helper'
require 'fakefs/safe'

RSpec.describe ProjectsController, type: :request do
  
  describe 'POST /api/project' do
  
    describe 'valid request' do
      let(:project_creation_json) { {"name" => "Some project", "slug" => "test" } }

      it 'adds new record' do
        expect {
          post '/api/project', params: project_creation_json
        }.to change(Project, :count).by(1)
      end

      it 'returns ok' do
        post '/api/project', params: project_creation_json

        expect(response.status).to eq(200)
        expect(response.content_type).to eq "application/json"
        expect(Project.find_by(slug: "test").name).to eq "Some project"
      end

    end
    
    describe 'invalid request' do
      let(:invalid_params) { {"dbType" => "sqlite3", "project" =>{"name" => "Some project", "slug" => nil }} }

      it 'returns bad request' do
        post '/api/project', params: invalid_params
        expect(response).to have_http_status(400)
      end
    end
  end

  describe 'PUT /api/project/:project_id' do
    let(:auth_headers) { {"Authorization" => "Basic #{Base64.encode64('user:user')}"} }

    let(:project) { create(:project, name: 'Test', slug: 'test') }
    let(:update_params) {
      {
        "name" => "Hello Test",
        "apiVersion" => 4,
        "activeDatabase" => "default",
        "slug" => "test",
        "description" => "This is a test proejct"
      }
    }

    it 'denies unauthenticated requests' do
      put "/api/project/#{project.slug}", params: update_params
      expect(response).to have_http_status(401)
    end

    describe 'valid request' do      
      before { put "/api/project/#{project.slug}", params: update_params, headers: auth_headers }
      
      it 'updates the record' do
        expect(response.body).to be_empty
      end

      it 'returns status code 204' do
        expect(response).to have_http_status(204)
      end
    end
  end
end
