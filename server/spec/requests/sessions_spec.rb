
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

    json_data = JSON.parse(response.body)

    expect(json_data['token']).to be_truthy  
  end
end
