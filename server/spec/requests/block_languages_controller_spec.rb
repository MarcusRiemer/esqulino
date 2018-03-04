require 'rails_helper'

RSpec.describe BlockLanguagesController, type: :request do
  json_headers = { "CONTENT_TYPE" => "application/json" }

  describe 'GET /api/block-language' do
    it 'lists nothing if nothing is there' do
      get "/api/block-language/"

      expect(response).to have_http_status(200)
      expect(JSON.parse(response.body).length).to eq 0
    end

    it 'lists a single block language' do
      FactoryBot.create(:block_language)
      get "/api/block-language/"

      expect(response).to have_http_status(200)

      json_data = JSON.parse(response.body)

      expect(json_data.length).to eq 1

      expect(json_data[0]).to validate_against "BlockLanguageListDescription"
    end

  end
end
