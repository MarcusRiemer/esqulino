require 'rails_helper'

RSpec.fdescribe "sessions controller" do
  json_headers = { "CONTENT_TYPE" => "application/json" }



  it 'testing the developer strategy' do

    byebug
    params = {
      name: "2@gmail.com", email: "123",
      session: {name: "2@gmail.com", email: "123"}
    }
    post '/api/auth/developer/callback',
      :headers => json_headers,
      :params => params.to_json

    expect(response).to have_http_status(200)
  end
end
