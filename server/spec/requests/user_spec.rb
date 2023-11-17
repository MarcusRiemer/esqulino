require 'rails_helper'

RSpec.describe 'user controller' do
  json_headers = { 'CONTENT_TYPE' => 'application/json' }

  before(:each) { create(:user, :guest) }

  describe 'getting user description' do
    it 'logged in' do
      user = create(:user, :validated)
      set_access_token(user)

      get '/api/user'

      json_data = JSON.parse(response.body)
      expect(json_data['roles']).to eq(['validated'])
    end

    it 'logged out' do
      get '/api/user'

      json_data = JSON.parse(response.body)

      aggregate_failures do
        expect(json_data['userId']).to eq(User.guest_id)
        expect(json_data['displayName']).to eq(User.guest.display_name)
        expect(json_data['roles']).to eq(['guest'])
        expect(response.status).to eq(200)
      end
    end

    it 'access token expired' do
      set_expired_access_token

      get '/api/user'
      json_data = JSON.parse(response.body)
      aggregate_failures do
        expect(json_data).to validate_against 'UnexpectedLogoutDescription'
        expect(response.status).to eq(400)
      end
    end
  end

  it 'forwards to the keycloak accountpage' do
    get '/api/user/keycloak_account_settings'

    assert_redirected_to %r{.*/auth/realms/.*/account/}
  end
end
