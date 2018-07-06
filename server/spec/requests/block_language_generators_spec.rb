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
  
end
