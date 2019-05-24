
require 'rails_helper'

RSpec.fdescribe "sessions controller" do
  before(:each) do
    OmniAuth.config.test_mode = true
    OmniAuth.config.mock_auth[:developer] = OmniAuth::AuthHash.new({
      :provider => 'developer',
      :uid => '123545'
    })
  end

  it "login a user with developer strategy" do
    get '/api/auth/developer/callback'
    expect(response.cookies['XSRF-TOKEN']).to be_truthy  
    expect(response.status).to eq(200)
  end

  it "logout a user with developer strategy" do
    get '/api/auth/developer/callback'
    expect(response.cookies['XSRF-TOKEN']).to be_truthy  

    get '/api/auth/sign_out'
    expect(response.cookies['XSRF-TOKEN']).to be_nil
    expect(response.status).to eq(200)
  end

  it "testing the json response of a sign_in" do
    get '/api/auth/developer/callback'
    json_data = JSON.parse(response.body)
    expect(json_data['role']).to eq('user')  
  end
end
