require 'rails_helper'

require 'tempfile'

RSpec.describe ProjectImagesController, type: :request do
  let(:auth_headers) { {"Authorization" => "Basic #{Base64.encode64('user:user')}"} }

  let(:minimal_svg) {
    file = Tempfile.new('minimal.svg')
    file.write '<svg xmlns="http://www.w3.org/2000/svg">'

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
end