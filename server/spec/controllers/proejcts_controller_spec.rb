require 'rails_helper'

RSpec.describe ProjectsController do
  
  describe '#create' do
  
    describe "valid request" do
      let(:project_creation_json) { 
        {
          "apiVersion": "4",
          "slug": "test",
          "name": "Test project",
          "admin": {
            "name": "user",
            "password": "user"
          },
          "dbType": "sqlite3"
        }
      }

      it "adds new project" do
        expect{
          post :create, params: project_creation_json
        }.to change(Project, :count).by(1)
      end

      it 'returns ok' do
        post :create, params: project_creation_json, format: :json

        expect(response.status).to eq(200)
        expect(response.content_type).to eq "application/json"
        expect(Project.all.last.slug).to eq("test")
      end

    end
    
    describe "invalid request" do
      let(:invalid_params) { {"name" => "Some project", "slug" => nil }}

      it 'returns bad request' do
        post :create, params: invalid_params, format: :json
        expect(response.status).to eq(400)
      end
    end
  end

  describe "#edit" do
    describe 'valid request' do
      let(:project) { create(:project, name: 'Test', slug: 'test') }
      let(:update_params) { {id: project.id ,name: 'Hello Test', slug: 'test', description: 'This is a test project'} }

      xit 'updates an exisiting project' do
        post "api/project/#{project.slug}", params: update_params
        expect(Project.find_by(project.id).name).to eq('Hello Test')
      end

      xit 'returns ok' do
      end
    end
  end
end
