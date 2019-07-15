require 'rails_helper'

RSpec.describe BlockLanguagesController, type: :request do
  json_headers = { "CONTENT_TYPE" => "application/json" }

  describe 'GET /api/grammars' do
    it 'lists nothing if nothing is there' do
      get "/api/grammars"

      expect(response).to have_http_status(200)
      expect(JSON.parse(response.body).length).to eq 0
    end

    it 'lists a grammar' do
      FactoryBot.create(:grammar)
      get "/api/grammars"

      expect(response).to have_http_status(200)

      json_data = JSON.parse(response.body)

      expect(json_data.length).to eq 1
      expect(json_data[0]).to validate_against "GrammarListDescription"
    end
  end

  describe 'GET /api/grammars/:grammarId' do
    it 'finds a single grammar by ID' do
      g = FactoryBot.create(:grammar)
      get "/api/grammars/#{g.id}"

      expect(response).to have_http_status(200)

      json_data = JSON.parse(response.body)

      expect(json_data).to validate_against "GrammarDescription"
    end

    it 'finds a single grammar by slug' do
      g = FactoryBot.create(:grammar)
      get "/api/grammars/#{g.slug}"

      expect(response).to have_http_status(200)

      json_data = JSON.parse(response.body)

      expect(json_data).to validate_against "GrammarDescription"
    end

    it 'responds with 404 for non existing grammars' do
      get "/api/grammars/0"
      expect(response).to have_http_status(404)
    end
  end

  describe 'POST /api/grammars' do
    it 'Creates a new, empty grammar' do
      prog_lang = FactoryBot.create(:programming_language)

      post "/api/grammars",
           :headers => json_headers,
           :params => {
             "slug" => "spec",
             "name" => "Spec Grammar",
             "technicalName" => "spec",
             "programmingLanguageId" => prog_lang.id,
             "types" => {
               "spec" => {
                 "root" => {
                   "type" => "concrete",
                   "attributes" => []
                 }
               }
             },
             "root" => {
               "languageName" => "spec",
               "typeName" => "root"
             }
           }.to_json

      expect(response.content_type).to eq "application/json"

      json_data = JSON.parse(response.body)
      expect(json_data.fetch('errors', [])).to eq []

      g = Grammar.find(json_data['id'])
      expect(g.name).to eq "Spec Grammar"
      expect(g.technical_name).to eq "spec"
      expect(g.slug).to eq "spec"
      expect(g.model["root"]).to eq({ "languageName" => "spec", "typeName" => "root"})
      expect(g.model["types"]["spec"]["root"]).to eq({ "type" => "concrete", "attributes" => [] })

      expect(response.status).to eq(200)
    end

    it 'Attempts to creates a new, invalid grammar' do
      prog_lang = FactoryBot.create(:programming_language)

      post "/api/grammars",
           :headers => json_headers,
           :params => {
             "slug" => "spec",
             "name" => "Spec Grammar"
           }.to_json

      expect(response.content_type).to eq "application/json"
      expect(response.status).to eq(400)

      json_data = JSON.parse(response.body)
      # Missing programming language
      expect(json_data['errors']['model'].length).to eq 1
    end
  end

  describe 'PUT /api/grammars/:id' do
    it 'Updating basic properties' do
      orig_grammar = FactoryBot.create(:grammar)
      upda_grammar = {
        "name" => "Upda",
        "types" => {},
        "root" => {
          "languageName" => "spec",
          "typeName" => "root"
        }
      }

      put "/api/grammars/#{orig_grammar.id}",
          :headers => json_headers,
          :params => upda_grammar.to_json

      if (not response.body.blank?) then
        json_data = JSON.parse(response.body)
        expect(json_data.fetch('errors', [])).to eq []
      end

      orig_grammar.reload
      expect(orig_grammar.name).to eq upda_grammar['name']
      expect(orig_grammar.model["types"]).to eq Hash.new
      expect(orig_grammar.model["root"]).to eq ({ "languageName" => "spec", "typeName" => "root" })
    end

    it 'Update with empty model' do
        original = FactoryBot.create(:grammar)

        params_update = FactoryBot
                          .attributes_for(:grammar,
                                          name: "Updated empty",
                                          model: Hash.new)
                          .transform_keys { |k| k.to_s.camelize(:lower) }
        params_update_req = params_update.merge(params_update["model"])
        params_update_req.delete("model")

        put "/api/grammars/#{original.id}",
            :headers => json_headers,
            :params => params_update_req.to_json

        expect(response.status).to eq(400)
        refreshed = Grammar.find(original.id)
        expect(original.name).to eq refreshed.name
      end
  end

  describe 'DELETE /api/grammars/:grammarId' do
    it 'removes unreferenced grammar' do
      g = FactoryBot.create(:grammar)

      delete "/api/grammars/#{g.id}",
             :headers => json_headers

      expect(response.status).to eq(204)

      get "/api/grammars/#{g.id}"

      expect(response.status).to eq(404)
    end

    it 'keeps referenced grammars' do
      b = FactoryBot.create(:block_language)

      delete "/api/grammars/#{b.grammar_id}",
             :headers => json_headers

      expect(response.status).to eq(400)
      json_data = JSON.parse(response.body)
      expect(json_data.fetch('errors', []).length).to eq 1
      expect(json_data['errors'][0]).to eq "EXISTING_REFERENCES"

      get "/api/grammars/#{b.grammar_id}"

      expect(response.status).to eq(200)
    end
  end

  describe 'GET /api/grammars/:grammarId/related_block_languages' do
    it 'Finds nothing for an unused grammar' do
      original = FactoryBot.create(:grammar)

      get "/api/grammars/#{original.id}/related_block_languages",
          :headers => json_headers

      expect(response.status).to eq(200)

      json_data = JSON.parse(response.body)
      expect(json_data.length).to eq 0
    end

    it 'Finds the single related block language' do
      original = FactoryBot.create(:grammar)
      related = FactoryBot.create(:block_language, grammar: original)

      get "/api/grammars/#{original.id}/related_block_languages",
          :headers => json_headers

      expect(response.status).to eq(200)

      json_data = JSON.parse(response.body)

      expect(json_data.length).to eq 1
      expect(json_data[0]).to validate_against "BlockLanguageListDescription"
      expect(json_data[0]['name']).to eq related.name
    end

    it 'Ignores unrelated block languages' do
      original = FactoryBot.create(:grammar)
      related = FactoryBot.create(:block_language, grammar: original)
      unrelated = FactoryBot.create(:block_language)

      get "/api/grammars/#{original.id}/related_block_languages",
          :headers => json_headers

      expect(response.status).to eq(200)

      json_data = JSON.parse(response.body)

      expect(json_data.length).to eq 1
      expect(json_data[0]).to validate_against "BlockLanguageListDescription"
      expect(json_data[0]['name']).to eq related.name
    end
  end
end
