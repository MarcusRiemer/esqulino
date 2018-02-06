require 'rails_helper'

RSpec.describe CodeResourcesController, type: :controller do
  describe "CREATE" do
    it "works with default factory bot object" do
      creation_attr = FactoryBot.build(:code_resource).attributes
      
      post :create,
           :format => :json,
           :params => creation_attr

      expect(response.status).to eq(200)
      expect(response.content_type).to eq "application/json"

      result = JSON.parse response.body

      expect(result['name']).to eq creation_attr['name']
    end

    it "stores valid syntaxtrees" do
      creation_attr = FactoryBot.build(
        :code_resource,
        ast: {
          :language => "specLang",
          :name => "specName",    
        }
      ).attributes
            
      post :create,
           :format => :json,
           :params => creation_attr
      
      expect(response.status).to eq(200)
      expect(response.content_type).to eq "application/json"

      result = JSON.parse response.body

      expect(result['name']).to eq creation_attr['name']
      expect(result['ast']['language']).to eq creation_attr['ast']['language']
      expect(result['ast']['name']).to eq creation_attr['ast']['name']
    end

    it "requires a name" do
      creation_attr = FactoryBot.build(:code_resource, name: nil).attributes
      post :create,
           :format => :json,
           :params => creation_attr
      
      expect(response.status).to eq(400)
      expect(response.content_type).to eq "application/json"

      result = JSON.parse response.body
      expect(result['errors']['name'].length).to eq 1
    end

    it "fails with a non-existant project" do
      expect { post :create, :params => { :name => "Foo" } }.to raise_exception ActionController::UrlGenerationError
    end

    it "works with an existing project" do
      post :create,
           :format => :json,
           :params => { :project_id => "unobtanium" }

      expect(response.status).to eq(404)
      expect(response.content_type).to eq "application/json"
    end

    it "rejects invalid syntax trees" do
      creation_attr = FactoryBot.build(:code_resource, ast: { :foo => "bar" }).attributes

      post :create,
           :format => :json,
           :params => creation_attr

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
      resource = FactoryBot.create(:code_resource, name: "Initial")
      creation_attr = resource.attributes

      put :update,
          :format => :json,
          :params => { :name => "Changed",
                       :code_resource_id => resource['id'],
                       :project_id => creation_attr['project_id'] }

      expect(response.status).to eq 200
      expect(response.content_type).to eq "application/json"
      
      result = JSON.parse response.body
      expect(result['name']).to eq "Changed"
    end

    it "changes the programming language", :focus do
      new_lang = FactoryBot.create(:programming_language)
      resource = FactoryBot.create(:code_resource, name: 'Initial')
      creation_attr = resource.attributes

      put :update,
          :format => :json,
          :params => { :programmingLanguageId => new_lang.id,
                       :code_resource_id => resource['id'],
                       :project_id => creation_attr['project_id'] }

      expect(response.status).to eq 200
      expect(response.content_type).to eq "application/json"
      
      result = JSON.parse response.body
      expect(result['programming_language_id']).to eq new_lang.id
    end
  end

  describe "DELETE" do
    it "a resource does not exist" do
      proj = FactoryBot.create(:project)
      delete :destroy,
             :format => :json,
             :params => {
               :project_id => proj.id,
               :code_resource_id => "never existed"
             }

      expect(response.status).to eq(404)
    end

    it "a resource that exists" do
      creation_attr = FactoryBot.build(:code_resource, name: "Initial").attributes
      
      post :create,
           :format => :json,
           :params => creation_attr

      expect(response.status).to eq(200)
      expect(response.content_type).to eq "application/json"

      resource = JSON.parse response.body

      delete :destroy,
             :format => :json,
             :params => {
               :project_id => creation_attr['project_id'],
               :code_resource_id => resource['id']
             }

      expect(response.status).to eq(200)
    end
  end
end
