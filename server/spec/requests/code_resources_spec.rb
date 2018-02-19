require "rails_helper"

RSpec.describe "CodeResource request", :type => :request do

  JSON_HEADERS = { "CONTENT_TYPE" => "application/json" }
  
  describe "CREATE" do
    it "works with default factory bot object" do
      resource = FactoryBot.build(:code_resource)
      
      post "/api/project/#{resource.project.slug}/code_resources/",
           :headers => JSON_HEADERS,
           :params => {
             "name" => resource.name,
             "blockLanguageId" => resource.block_language_id,
             "programmingLanguageId" => resource.programming_language_id,
           }.to_json

      expect(response.status).to eq(200)
      expect(response.content_type).to eq "application/json"

      result = JSON.parse response.body
      expect(result['name']).to eq resource.name
      expect(result['blockLanguageId']).to eq resource.block_language_id
      expect(result['programmingLanguageId']).to eq resource.programming_language_id
    end

    it "requires name, programming language and block languge" do
      resource = FactoryBot.build(:code_resource)
      
      post "/api/project/#{resource.project.slug}/code_resources/",
           :headers => JSON_HEADERS,
           :params => {
           }.to_json

      expect(response.status).to eq(400)
      expect(response.content_type).to eq "application/json"

      result = JSON.parse response.body
      expect(result['errors']['name'].length).to eq 1
      expect(result['errors']['block_language'].length).to eq 1
      expect(result['errors']['programming_language'].length).to eq 1
    end

    it "stores valid syntaxtrees" do
      resource = FactoryBot.build(
        :code_resource,
        ast: {
          :language => "specLang",
          :name => "specName",    
        }
      )
      
      post "/api/project/#{resource.project.slug}/code_resources/",
           :headers => JSON_HEADERS,
           :params => {
             "name" => resource.name,
             "blockLanguageId" => resource.block_language_id,
             "programmingLanguageId" => resource.programming_language_id,
             "ast" => resource.ast
           }.to_json

      expect(response.status).to eq(200)
      expect(response.content_type).to eq "application/json"

      result = JSON.parse response.body
      expect(result['name']).to eq resource.name
      expect(result['blockLanguageId']).to eq resource.block_language_id
      expect(result['programmingLanguageId']).to eq resource.programming_language_id
      expect(result['ast']).to eq resource.ast
    end

    it "rejects invalid syntax trees" do
      resource = FactoryBot.build(:code_resource, ast: { :foo => "bar" })
      
      post "/api/project/#{resource.project.slug}/code_resources/",
           :headers => JSON_HEADERS,
           :params => {
             "name" => resource.name,
             "blockLanguageId" => resource.block_language_id,
             "programmingLanguageId" => resource.programming_language_id,
             "ast" => resource.ast
           }.to_json

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
    
      put "/api/project/#{resource.project.slug}/code_resources/#{resource.id}",
          :headers => JSON_HEADERS,
          :params => { "name" => "Changed" }.to_json

      expect(response.status).to eq 200
      expect(response.content_type).to eq "application/json"
      
      result = JSON.parse response.body
      expect(result['name']).to eq "Changed"
    end

    
    it "changes the programming language" do
      new_lang = FactoryBot.create(:programming_language)
      resource = FactoryBot.create(:code_resource)
      creation_attr = resource.attributes

      put "/api/project/#{resource.project.slug}/code_resources/#{resource.id}",
          :headers => JSON_HEADERS,
          :params => { "programmingLanguageId" => new_lang.id }.to_json

      expect(response.status).to eq 200
      expect(response.content_type).to eq "application/json"
      
      result = JSON.parse response.body
      expect(result['programming_language_id']).to eq new_lang.id
    end
  end

  describe "DELETE" do
    it "a resource does not exist" do
      project = FactoryBot.create(:project)
      delete "/api/project/#{project.slug}/code_resources/nonexistant",
             :headers => JSON_HEADERS

      expect(response.status).to eq(404)
    end


    it "a resource that exists" do
      resource = FactoryBot.create(:code_resource)
      delete "/api/project/#{resource.project.slug}/code_resources/#{resource.id}",
             :headers => JSON_HEADERS

      expect(response.status).to eq(200)
    end
  end
  
end