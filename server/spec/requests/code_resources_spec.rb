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
