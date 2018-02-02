require 'rails_helper'

RSpec.describe CodeResourcesController, type: :controller do
  describe "CREATE" do
    it "works with only a name and a project_id" do
      proj = FactoryBot.create(:project)
      post :create,
           :format => :json,
           :params => { :name => "Any", :project_id => proj.id }

      expect(response.status).to eq(200)
      expect(response.content_type).to eq "application/json"

      result = JSON.parse response.body

      expect(result['name']).to eq "Any"
    end

    it "stores valid syntaxtrees" do
      proj = FactoryBot.create(:project)
      post :create,
           :format => :json,
           :params => {
             :name => "Any",
             :project_id => proj.id,
             :ast => {
               :language => "specLang",
               :name => "specName",
             }
           }

      expect(response.status).to eq(200)
      expect(response.content_type).to eq "application/json"

      result = JSON.parse response.body

      expect(result['name']).to eq "Any"
      expect(result['ast']['language']).to eq "specLang"
      expect(result['ast']['name']).to eq "specName"
    end

    it "requires a name" do
      proj = FactoryBot.create(:project)
      post :create,
           :format => :json,
           :params => { :project_id => proj.id }

      expect(response.status).to eq(400)
      expect(response.content_type).to eq "application/json"
    end

    it "requires a project" do
      expect { post :create, :params => { :name => "Foo" } }.to raise_exception ActionController::UrlGenerationError
    end

    it "requires an existing project" do
      post :create,
           :format => :json,
           :params => { :project_id => "unobtanium" }

      expect(response.status).to eq(404)
      expect(response.content_type).to eq "application/json"
    end

    it "rejects invalid syntax trees" do
      proj = FactoryBot.create(:project)
      post :create,
           :format => :json,
           :params => {
             :name => "invalid tree",
             :project_id => proj.id,
             :ast => {
               :foo => "bar"
             }
           }

      expect(response.status).to eq(400)
      expect(response.content_type).to eq "application/json"

      result = JSON.parse response.body

      # 1) No name
      # 2) No language
      # 3) Unnecessary field "foo"
      expect(result['errors']['ast'].length).to eq 3
    end
  end

  describe "UPDATE" do
    it "changes the name" do
      proj = FactoryBot.create(:project)
      post :create,
           :format => :json,
           :params => { :name => "Initial", :project_id => proj.id }

      expect(response.status).to eq(200)
      expect(response.content_type).to eq "application/json"

      resource = JSON.parse response.body

      put :update,
          :format => :json,
          :params => { :name => "Changed",
                       :code_resource_id => resource['id'],
                       :project_id => proj.id }

      expect(response.status).to eq(200)
      expect(response.content_type).to eq "application/json"
      
      result = JSON.parse response.body
      expect(result['name']).to eq "Changed"
    end
  end

  describe "DELETE" do
    it "does not exist" do
      proj = FactoryBot.create(:project)
      delete :destroy,
             :format => :json,
             :params => {
               :project_id => proj.id,
               :code_resource_id => "never existed"
             }

      expect(response.status).to eq(404)
    end

    it "exists" do
            proj = FactoryBot.create(:project)
      post :create,
           :format => :json,
           :params => { :name => "Initial", :project_id => proj.id }

      expect(response.status).to eq(200)
      expect(response.content_type).to eq "application/json"

      resource = JSON.parse response.body

      delete :destroy,
             :format => :json,
             :params => {
               :project_id => proj.id,
               :code_resource_id => resource['id']
             }

      expect(response.status).to eq(200)
    end
  end
end
