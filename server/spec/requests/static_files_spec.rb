require 'rails_helper'

RSpec.describe StaticFilesController, type: :request do
  describe 'index.html for various paths' do
    it '/' do
      get '/'

      expect(response).to have_http_status(200)
      expect(response.content_type).to eq('text/html')
    end

    it '/index.html' do
      get '/index.html'

      expect(response).to have_http_status(200)
      expect(response.content_type).to eq 'text/html'
    end

    it '/about' do
      get '/about'

      expect(response).to have_http_status(200)
      expect(response.content_type).to eq 'text/html'
    end
  end

  describe 'static assets' do
    it '/vendor/logos/blattwerkzeug-caption.svg' do
      get '/vendor/logos/blattwerkzeug-caption.svg'

      expect(response).to have_http_status(200)
      expect(response.content_type).to eq 'image/svg+xml'
    end

    it '/vendor/logos/cau.png' do
      get '/vendor/logos/cau.png'

      expect(response).to have_http_status(200)
      expect(response.content_type).to eq 'image/png'
    end
  end

  describe 'schemas' do
    it '/api/schema/nonexistant' do
      get '/api/schema/nonexistant'

      expect(response).to have_http_status(404)
    end

    it '/api/schema/GrammarDocument' do
      get '/api/json_schema/GrammarDocument'

      expect(response).to have_http_status(200)
      expect(response.content_type).to eq 'application/json'
    end
  end
end
