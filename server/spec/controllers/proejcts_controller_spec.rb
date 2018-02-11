require 'rails_helper'

RSpec.describe ProjectsController do
  
  describe '#create' do
  
    describe "valid request" do
      let(:valid_params) { {name: 'Test Projct', slug: 'test-project'} }

      it "adds new project" do
        expect{
          post :create, params: valid_params
        }.to change(Project, :count).by(1)
      end

      it 'returns ok' do
        post :create, params: valid_params, format: :json

        expect(response.status).to eq(200)
        expect(response.content_type).to eq "application/json"
        expect(Project.all.last.slug).to eq("test-project")
      end

    end
    
    describe "invalid request" do
      let(:invalid_params) { {name: "Some project", slug: "" }}

      it 'returns bad request' do
        post :create, params: invalid_params
        expect(response.status).to eq(400)
      end
    end
  end

  describe "#edit" do
    describe 'valid request' do
      let(:project) { create(:project, name: 'Test', slug: 'test') }
      let(:update_params) { {id: project.id ,name: 'Hello Test', slug: 'test', description: 'This is a test project'} }

      xit 'updates an exisiting project' do
        post :edit, params: update_params
        expect(Project.find_by(project.id).name).to eq('Hello Test')
      end

      xit 'returns ok' do
      end
    end
  end
end
