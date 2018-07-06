require 'rails_helper'

RSpec.describe BlockLanguagesController, type: :request do
  json_headers = { "CONTENT_TYPE" => "application/json" }

  describe 'GET /api/block_language_generators' do
    it 'lists nothing if nothing is there' do
      get "/api/block_language_generators"

      expect(response).to have_http_status(200)
      expect(JSON.parse(response.body).length).to eq 0
    end

    it 'lists a single block language' do
      FactoryBot.create(:block_language_generator)
      get "/api/block_language_generators"

      expect(response).to have_http_status(200)

      json_data = JSON.parse(response.body)

      expect(json_data.length).to eq 1
      expect(json_data[0]).to validate_against "BlockLanguageGeneratorListDescription"
    end
  end

  describe 'GET /api/block_language_generators/:blockLanguageGeneratorId' do
    it 'shows a single block language' do
      b = FactoryBot.create(:block_language_generator)
      get "/api/block_language_generators/#{b.id}"

      expect(response).to have_http_status(200)

      json_data = JSON.parse(response.body)

      expect(json_data).to validate_against "BlockLanguageGeneratorDescription"
    end

    it 'responds with 404 for non existing generators' do
      get "/api/block_language_generators/0"
      expect(response).to have_http_status(404)
    end
  end

  describe 'POST /api/block_language_generators' do
    it 'Creates a new, empty block language generator' do
      params_generator = FactoryBot
                           .attributes_for(:block_language_generator)
                           .transform_keys { |k| k.to_s.camelize(:lower) }
      params_generator_req = params_generator.merge(params_generator["model"])

      post "/api/block_language_generators",
           :headers => json_headers,
           :params => params_generator_req.to_json

      expect(response.content_type).to eq "application/json"

      json_data = JSON.parse(response.body)
      expect(json_data.fetch('errors', [])).to eq []

      expect(response.status).to eq(200)

      # Check what exactly has been saved
      generator = BlockLanguageGenerator.find(json_data["id"])

      expect(params_generator["name"]).to eq generator.name
      expect(params_generator["model"].to_json).to eq generator.model.to_json
    end

    it 'passing no parameters for creation' do
      post "/api/block_language_generators",
           :headers => json_headers,
           :params => "{}"

      expect(response.content_type).to eq "application/json"

      json_data = JSON.parse(response.body)
      expect(response.status).to eq(400)

      expect(json_data["errors"].fetch("name", [])).not_to be []
      expect(json_data["errors"].fetch("targetName", [])).not_to be []
      expect(json_data["errors"].fetch("model", [])).not_to be []
    end
  end

  describe 'PUT /api/block_language_generators' do
    it 'Update all properties' do
      original = FactoryBot.create(:block_language_generator)

      params_update = FactoryBot
                        .attributes_for(:block_language_generator,
                                        name: "Upda",
                                        target_name: "Upda",
                                        model: {
                                          "editorComponents":
                                                  [
                                                    { "componentType": "query-preview" }
                                                  ]
                                        })
                           .transform_keys { |k| k.to_s.camelize(:lower) }
      params_update_req = params_update.merge(params_update["model"])

      put "/api/block_language_generators/#{original.id}",
           :headers => json_headers,
           :params => params_update_req.to_json

      expect(response.status).to eq(204)

      original.reload
      expect(params_update["name"]).to eq original.name
      expect(params_update["targetName"]).to eq original.target_name
      expect(params_update["model"].to_json).to eq original.model.to_json
    end

    it 'Update with empty model' do
      original = FactoryBot.create(:block_language_generator)

      params_update = FactoryBot
                        .attributes_for(:block_language_generator,
                                        name: "Updated empty",
                                        target_name: "Updated empty",
                                        model: Hash.new)
                           .transform_keys { |k| k.to_s.camelize(:lower) }
      params_update_req = params_update

      put "/api/block_language_generators/#{original.id}",
           :headers => json_headers,
           :params => params_update_req.to_json
      
      expect(response.status).to eq(400)
      refreshed = BlockLanguageGenerator.find(original.id)
      expect(original.name).to eq refreshed.name
      expect(original.target_name).to eq refreshed.target_name
    end

    it 'Update without model' do
      original = FactoryBot.create(:block_language_generator)

      params_update = FactoryBot
                        .attributes_for(:block_language_generator,
                                        name: "Updated without",
                                        target_name: "Updated without",
                                        model: nil)
                           .transform_keys { |k| k.to_s.camelize(:lower) }
      params_update_req = params_update

      put "/api/block_language_generators/#{original.id}",
           :headers => json_headers,
           :params => params_update_req.to_json
      
      expect(response.status).to eq(400)
      refreshed = BlockLanguageGenerator.find(original.id)
      expect(original.name).to eq refreshed.name
      expect(original.target_name).to eq refreshed.target_name
    end
  end
end
