require 'rails_helper'

RSpec.describe StaticFilesController, type: :request do
  describe 'index.html for various paths' do

    it '/', :skip_on_ci do
      skip "Skipping this example on GitLab CI" if ENV['CI']

      get '/'

      expect(response).to have_http_status(200)
      expect(response.content_type).to eq("text/html")
    end

    it '/index.html', :skip_on_ci do
      skip "Skipping this example on GitLab CI" if ENV['CI']

      get '/index.html'

      expect(response).to have_http_status(200)
      expect(response.content_type).to eq "text/html"
    end

    it '/about', :skip_on_ci do
      skip "Skipping this example on GitLab CI" if ENV['CI']

      get '/about'

      expect(response).to have_http_status(200)
      expect(response.content_type).to eq "text/html"
    end
  end

  describe 'static assets', :skip_on_ci do
    it '/vendor/logos/blattwerkzeug-caption.svg', :skip_on_ci do
      skip "Skipping this example on GitLab CI" if ENV['CI']
      get '/vendor/logos/blattwerkzeug-caption.svg'

      expect(response).to have_http_status(200)
      expect(response.content_type).to eq "image/svg+xml"
    end

    it '/vendor/logos/cau.png', :skip_on_ci do
      skip "Skipping this example on GitLab CI" if ENV['CI']
      get '/vendor/logos/cau.png'

      expect(response).to have_http_status(200)
      expect(response.content_type).to eq "image/png"
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
      expect(response.content_type).to eq "application/json"
    end
  end
end
