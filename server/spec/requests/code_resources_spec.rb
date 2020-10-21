require "rails_helper"

RSpec.describe "CodeResource request", :type => :request do
  json_headers = { "CONTENT_TYPE" => "application/json" }

  describe "GET code_resources/by_programming_language/:programming_language_id" do
    def url_for(lang)
      "/api/code_resources/by_programming_language/#{lang}"
    end

    describe "No code resources at all" do
      it "css" do
        get url_for("css")

        result = JSON.parse response.body
        expect(result).to eq []
      end

      it "sql" do
        get url_for("sql")

        result = JSON.parse response.body
        expect(result).to eq []
      end
    end

    describe "Single SQL and CSS resource" do
      before (:each) do
        FactoryBot.create(:programming_language, id: "css")
        FactoryBot.create(:code_resource, :sql_key_value_select_double, name: "sql")
        FactoryBot.create(:code_resource, programming_language_id: "css", name: "css")
      end

      it "css" do
        get url_for("css")

        result = JSON.parse response.body
        expect(result.length).to eq 1
        expect(result[0]["name"]).to eq "css"
      end

      it "sql" do
        get url_for("sql")

        result = JSON.parse response.body
        expect(result[0]["name"]).to eq "sql"
      end
    end
  end

  describe "CREATE" do
    it "properly fails on missing projects (slug)" do
      resource = FactoryBot.build(:code_resource)

      post "/api/project/invalid/code_resources/",
           :headers => json_headers,
           :params => {
             "name" => resource.name,
             "blockLanguageId" => resource.block_language_id,
             "programmingLanguageId" => resource.programming_language_id,
           }.to_json

      expect(response.status).to eq(404)
    end

    it "properly fails on missing projects (uuid)" do
      resource = FactoryBot.create(:code_resource)

      # Use the ID of the resource as ID of the project
      post "/api/project/#{resource.id}/code_resources/",
           :headers => json_headers,
           :params => {
             "name" => resource.name,
             "blockLanguageId" => resource.block_language_id,
             "programmingLanguageId" => resource.programming_language_id,
           }.to_json

      expect(response.status).to eq(404)
    end

    it "works with default factory bot object" do
      resource = FactoryBot.build(:code_resource)

      post "/api/project/#{resource.project.slug}/code_resources/",
           :headers => json_headers,
           :params => {
             "name" => resource.name,
             "blockLanguageId" => resource.block_language_id,
             "programmingLanguageId" => resource.programming_language_id,
           }.to_json

      expect(response.status).to eq(200)
      expect(response.media_type).to eq "application/json"

      result = JSON.parse response.body
      expect(result['name']).to eq resource.name
      expect(result['blockLanguageId']).to eq resource.block_language_id
      expect(result['programmingLanguageId']).to eq resource.programming_language_id
    end

    it "requires name, programming language and block languge" do
      resource = FactoryBot.build(:code_resource)

      post "/api/project/#{resource.project.slug}/code_resources/",
           :headers => json_headers,
           :params => {
           }.to_json

      expect(response.status).to eq(400)
      expect(response.media_type).to eq "application/json"

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
           :headers => json_headers,
           :params => {
             "name" => resource.name,
             "blockLanguageId" => resource.block_language_id,
             "programmingLanguageId" => resource.programming_language_id,
             "ast" => resource.ast
           }.to_json

      expect(response.status).to eq(200)
      expect(response.media_type).to eq "application/json"

      result = JSON.parse response.body
      expect(result['name']).to eq resource.name
      expect(result['blockLanguageId']).to eq resource.block_language_id
      expect(result['programmingLanguageId']).to eq resource.programming_language_id
      expect(result['ast']).to eq resource.ast
    end

    it "rejects invalid syntax trees" do
      resource = FactoryBot.build(:code_resource, ast: { :foo => "bar" })

      post "/api/project/#{resource.project.slug}/code_resources/",
           :headers => json_headers,
           :params => {
             "name" => resource.name,
             "blockLanguageId" => resource.block_language_id,
             "programmingLanguageId" => resource.programming_language_id,
             "ast" => resource.ast
           }.to_json

      expect(response.status).to eq(400)
      expect(response.media_type).to eq "application/json"

      result = JSON.parse response.body

      # 1) No name and no language
      # 2) Unnecessary field "foo"
      expect(result['errors']['ast'].length).to eq 2
    end
  end

  describe "UPDATE" do
    it "changes the name" do
      resource = FactoryBot.create(:code_resource, name: "Initial")

      put "/api/project/#{resource.project.slug}/code_resources/#{resource.id}",
          :headers => json_headers,
          :params => { "resource" => { "name" => "Changed" } }.to_json

      aggregate_failures do
        expect(response.status).to eq 200
        expect(response.media_type).to eq "application/json"

        result = JSON.parse response.body
        expect(result['name']).to eq "Changed"

        resource.reload
        expect(resource.name).to eq "Changed"
      end
    end

    it "doesn't change the ID" do
      resource = FactoryBot.create(:code_resource, name: "Initial")
      new_id = SecureRandom.uuid

      put "/api/project/#{resource.project.slug}/code_resources/#{resource.id}",
          :headers => json_headers,
          :params => { "resource" => { "id" => new_id } }.to_json

      aggregate_failures do
        expect(response.status).to eq 400
        expect(response.media_type).to eq "application/json"

        result = JSON.parse response.body
        expect(result['type']).to eq "InvalidSchema"

        # Also doesn't introduce a new resource
        expect(CodeResource.find_by(id: new_id)).to be nil
      end
    end

    it "changes the programming language" do
      new_lang = FactoryBot.create(:programming_language)
      resource = FactoryBot.create(:code_resource)
      creation_attr = resource.attributes

      put "/api/project/#{resource.project.slug}/code_resources/#{resource.id}",
          :headers => json_headers,
          :params => { "resource" => { "programmingLanguageId" => new_lang.id } }.to_json

      expect(response.status).to eq 200
      expect(response.media_type).to eq "application/json"

      result = JSON.parse response.body
      expect(result['programming_language_id']).to eq new_lang.id
    end

    it "doesn't change the programming language if the new ID doesn't exist" do
      new_lang_id = SecureRandom.uuid
      resource = FactoryBot.create(:code_resource)
      creation_attr = resource.attributes

      put "/api/project/#{resource.project.slug}/code_resources/#{resource.id}",
          :headers => json_headers,
          :params => { "resource" => { "programmingLanguageId" => new_lang_id } }.to_json

      aggregate_failures do
        expect(response.status).to eq 400
        expect(response.media_type).to eq "application/json"

        result = JSON.parse response.body
        expect(result).to eq ({ "errors" => { "programming_language" => ["must exist"] } })
      end
    end

    it "replace an existing AST with an empty AST" do
      new_lang = FactoryBot.create(:programming_language)
      resource = FactoryBot.create(:code_resource, :sql_key_value_select_double)
      creation_attr = resource.attributes

      put "/api/project/#{resource.project.slug}/code_resources/#{resource.id}",
          :headers => json_headers,
          :params => '{ "resource": { "ast": null } }'

      aggregate_failures do
        expect(response.status).to eq 200
        expect(response.media_type).to eq "application/json"

        result = JSON.parse response.body
        expect(result['ast']).to eq nil

        resource.reload
        expect(resource.ast).to eq nil
      end
    end

    it "replace an existing AST with an empty AST and a new name" do
      new_lang = FactoryBot.create(:programming_language)
      resource = FactoryBot.create(:code_resource, :sql_key_value_select_double)
      creation_attr = resource.attributes

      put "/api/project/#{resource.project.slug}/code_resources/#{resource.id}",
          :headers => json_headers,
          :params => '{ "resource": { "ast": null, "name": "new" } }'

      aggregate_failures do
        expect(response.status).to eq 200
        expect(response.media_type).to eq "application/json"

        result = JSON.parse response.body
        expect(result['ast']).to eq nil
        expect(result['name']).to eq "new"

        resource.reload
        expect(resource.ast).to eq nil
        expect(resource.name).to eq "new"
      end
    end

    it "replace an existing AST with another AST" do
      new_lang = FactoryBot.create(:programming_language)
      resource = FactoryBot.create(:code_resource, :sql_key_value_select_double)

      new_ast = { "language" => "l", "name" => "t" }

      put "/api/project/#{resource.project.slug}/code_resources/#{resource.id}",
          :headers => json_headers,
          :params => { "resource" => { "ast": new_ast } }.to_json

      aggregate_failures do
        expect(response.status).to eq 200
        expect(response.media_type).to eq "application/json"

        result = JSON.parse response.body
        expect(result['ast']).to eq new_ast

        resource.reload
        expect(resource.ast).to eq new_ast
      end
    end
  end

  describe "CLONE" do
    it "a resource does not exist" do
      project = FactoryBot.create(:project)
      post "/api/project/#{project.slug}/code_resources/nonexistant/clone",
           :headers => json_headers

      expect(response.status).to eq(404)
    end

    it "a resource that does exist" do
      resource = FactoryBot.create(:code_resource)
      project = resource.project
      post "/api/project/#{project.slug}/code_resources/#{resource.id}/clone",
           :headers => json_headers

      expect(response.status).to eq(200)
      expect(project.code_resources.length).to eq(2)

      resources_attributes = CodeResource.all.map do |r|
        r.attributes.except('id', 'created_at', 'updated_at')
      end
      expect(resources_attributes[0]).to eq(resources_attributes[1])
    end
  end

  describe "DELETE" do
    it "a resource does not exist" do
      project = FactoryBot.create(:project)
      delete "/api/project/#{project.slug}/code_resources/nonexistant",
             :headers => json_headers

      expect(response.status).to eq(404)
    end

    it "a resource that exists" do
      resource = FactoryBot.create(:code_resource)
      delete "/api/project/#{resource.project.slug}/code_resources/#{resource.id}",
             :headers => json_headers

      aggregate_failures do
        expect(response.status).to eq(204)
        expect(CodeResource.find_by(id: resource.id)).to eq nil
      end
    end

    it "keeps a resource that a grammar is based on" do
      resource = FactoryBot.create(:code_resource)
      grammar = FactoryBot.create(:grammar, generated_from: resource)

      delete "/api/project/#{resource.project.slug}/code_resources/#{resource.id}",
             :headers => json_headers

      aggregate_failures do
        expect(response.status).to eq(400)
        expect(response.body).to include grammar.id
        expect(response.body).to include resource.id

        expect(Grammar.find_by(id: grammar.id)).to eq grammar
        expect(CodeResource.find_by(id: resource.id)).to eq resource
      end
    end
  end
end
