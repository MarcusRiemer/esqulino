require 'rails_helper'

require 'tempfile'

RSpec.describe ProjectImagesController, type: :request do
  let(:auth_headers) { { "Authorization" => "Basic #{Base64.encode64('user:user')}" } }

  let(:minimal_svg) {
    file = Tempfile.new('minimal.svg')
    file.write '<svg xmlns="http://www.w3.org/2000/svg">'

    Rack::Test::UploadedFile.new(file.path, "image/svg")
  }

  let(:second_svg) {
    file = Tempfile.new('minimal.svg')
    file.write '<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">'

    Rack::Test::UploadedFile.new(file.path, "image/svg")
  }

  describe 'POST /api/project/:project_id/image' do
    it 'Fails to upload without an image' do
      p = FactoryBot.create(:project)

      post "/api/project/#{p.id}/image/",
           :headers => auth_headers,
           :params => {
             "image-name" => "FH Wedel",
           }

      expect(response.status).to eq 400
    end

    it 'Fails to upload without a name' do
      p = FactoryBot.create(:project)

      post "/api/project/#{p.id}/image/",
           :headers => auth_headers,
           :params => {
             "image-file" => minimal_svg,
           }

      expect(response.status).to eq 400
    end

    it 'Minimal image' do
      p = FactoryBot.create(:project)

      post "/api/project/#{p.id}/image/",
           :headers => auth_headers,
           :params => {
             "image-name" => "FH Wedel",
             "image-file" => minimal_svg,
           }

      expect(response.status).to eq 200
    end
  end

  describe 'GET /api/project/:project_id/image' do
    it 'Lists multiple images after uploading' do
      p = FactoryBot.create(:project)

      # Create first image
      post "/api/project/#{p.id}/image/",
           :headers => auth_headers,
           :params => { "image-name" => "img 1", "image-file" => minimal_svg }
      expect(response.status).to eq 200

      # Create second image
      post "/api/project/#{p.id}/image/",
           :headers => auth_headers,
           :params => { "image-name" => "img 2", "image-file" => minimal_svg }
      expect(response.status).to eq 200

      # Actually retrieve images
      get "/api/project/#{p.id}/image/",
          :headers => auth_headers
      expect(response.status).to eq 200

      expect(response).to have_http_status(200)

      data = JSON.parse(response.body)
      expect(data.length).to eq 2
    end
  end

  describe 'GET /api/project/:project_id/image/:image_id/metadata' do
    it 'Gracefully fails for UUIDs that are unknown' do
      p = FactoryBot.create(:project)

      image_id = "5e171ef3-3983-44bb-95eb-d3b2ac0d42b7"

      get "/api/project/#{p.id}/image/#{image_id}/metadata",
          :headers => auth_headers

      expect(response.status).to eq 404
    end

    it 'Gracefully fails for IDs that are empty' do
      p = FactoryBot.create(:project)

      image_id = ""

      post "/api/project/#{p.id}/image/#{image_id}/metadata",
           :headers => auth_headers

      expect(response.status).to eq 400
    end

    it 'Successfully retrieves the full set of metadata' do
      p = FactoryBot.create(:project)

      metadata = {
        "image-name" => "img 1",
        "author-name" => "author",
        "licence-name" => "licence",
        "licence-url" => "url"
      }

      # Create image and remember its ID
      post "/api/project/#{p.id}/image/",
           :headers => auth_headers,
           :params => { "image-file" => minimal_svg }.merge(metadata)
      expect(response.status).to eq 200

      image_id = response.body

      get "/api/project/#{p.id}/image/#{image_id}/metadata",
          :headers => auth_headers

      expect(response.status).to eq 200

      data = JSON.parse(response.body)
      expect(data['image-name']).to eq metadata["name"]
      expect(data['author-name']).to eq metadata["author-name"]
      expect(data['licence-name']).to eq metadata["licence-name"]
      expect(data['licence-url']).to eq metadata["licence-url"]
    end
  end

  describe 'POST /api/project/:project_id/image/:image_id/metadata' do
    it 'Gracefully fails for UUIDs that are unknown' do
      p = FactoryBot.create(:project)

      image_id = "5e171ef3-3983-44bb-95eb-d3b2ac0d42b7"

      post "/api/project/#{p.id}/image/#{image_id}/metadata",
           :headers => auth_headers

      expect(response.status).to eq 404
    end

    it 'Gracefully fails for IDs that are empty' do
      p = FactoryBot.create(:project)

      image_id = ""

      post "/api/project/#{p.id}/image/#{image_id}/metadata",
           :headers => auth_headers

      expect(response.status).to eq 400
    end

    it 'Successfully retrieves the full set of metadata' do
      p = FactoryBot.create(:project)

      # Create image and remember its ID
      post "/api/project/#{p.id}/image/",
           :headers => auth_headers,
           :params => {
             "image-name" => "img 1",
             "author-name" => "author",
             "licence-name" => "licence",
             "licence-url" => "url",
             "image-file" => minimal_svg
           }
      expect(response.status).to eq 200

      image_id = response.body

      # Update the metadata
      post "/api/project/#{p.id}/image/#{image_id}/metadata",
           :headers => auth_headers,
           :params => {
             "image-name" => "changed",
             "author-name" => "changed",
             "licence-name" => "changed",
             "licence-url" => "changed"
           }
      expect(response.status).to eq 200

      # Update the metadata
      get "/api/project/#{p.id}/image/#{image_id}/metadata",
          :headers => auth_headers
      expect(response.status).to eq 200

      data = JSON.parse(response.body)
      expect(data['name']).to eq "changed"
      expect(data['author-name']).to eq "changed"
      expect(data['licence-name']).to eq "changed"
      expect(data['licence-url']).to eq "changed"
    end
  end

  describe 'POST /api/project/:project_id/image/:image_id' do
    it 'Gracefully fails for UUIDs that are unknown' do
      p = FactoryBot.create(:project)

      image_id = "5e171ef3-3983-44bb-95eb-d3b2ac0d42b7"

      post "/api/project/#{p.id}/image/#{image_id}",
           :headers => auth_headers,
           :params => { "image-file" => second_svg }
      expect(response.status).to eq 404
    end

    it 'Gracefully fails for IDs that are empty' do
      p = FactoryBot.create(:project)

      image_id = ""

      post "/api/project/#{p.id}/image/#{image_id}",
           :headers => auth_headers,
           :params => { "image-file" => second_svg }
      expect(response.status).to eq 400
    end

    it 'Does not replace an existing image with a missing image' do
      p = FactoryBot.create(:project)

      # Create image and remember its ID
      post "/api/project/#{p.id}/image/",
           :headers => auth_headers,
           :params => { "image-name" => "img 1", "image-file" => minimal_svg }
      expect(response.status).to eq 200

      image_id = response.body

      post "/api/project/#{p.id}/image/#{image_id}",
           :headers => auth_headers
      expect(response.status).to eq 400
    end

    it 'Replaces the actual image of an existing image' do
      p = FactoryBot.create(:project)

      # Create image and remember its ID
      post "/api/project/#{p.id}/image/",
           :headers => auth_headers,
           :params => { "image-name" => "img 1", "image-file" => minimal_svg }
      expect(response.status).to eq 200

      image_id = response.body

      post "/api/project/#{p.id}/image/#{image_id}",
           :headers => auth_headers,
           :params => { "image-file" => second_svg }
      expect(response.status).to eq 200
    end
  end

  describe 'DELETE /api/project/:project_id/image/:image_id/' do
    it 'Gracefully fails for UUIDs that are unknown' do
      p = FactoryBot.create(:project)

      image_id = "5e171ef3-3983-44bb-95eb-d3b2ac0d42b7"

      delete "/api/project/#{p.id}/image/#{image_id}",
             :headers => auth_headers
      expect(response.status).to eq 404
    end

    it 'Gracefully fails for IDs that are empty' do
      p = FactoryBot.create(:project)

      image_id = ""

      delete "/api/project/#{p.id}/image/#{image_id}",
             :headers => auth_headers
      expect(response.status).to eq 404
    end

    it 'Deletes an existing image' do
      p = FactoryBot.create(:project)

      # Create image and remember its ID
      post "/api/project/#{p.id}/image/",
           :headers => auth_headers,
           :params => { "image-name" => "img 1", "image-file" => minimal_svg }
      expect(response.status).to eq 200

      image_id = response.body

      delete "/api/project/#{p.id}/image/#{image_id}",
             :headers => auth_headers

      expect(response.status).to eq 200
    end
  end
end
