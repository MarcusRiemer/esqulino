# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'auth controller' do
  before(:each) { create(:user, :guest) }

  describe 'developer provider with default values' do
    before(:all) do
      OmniAuth.config.test_mode = true
      OmniAuth.config.mock_auth[:developer] = OmniAuth::AuthHash.new({
                                                                       provider: 'developer',
                                                                       info: {
                                                                         name: 'Tom',
                                                                         email: 'developer@blattwerkzeug.de'
                                                                       },
                                                                       uid: 'developer@blattwerkzeug.de'
                                                                     })
    end

    context 'logging in' do
      it 'valid response' do
        get '/api/auth/developer/callback'

        expect(response).to have_http_status 302
        expect(response).to set_cookie %w[REFRESH_TOKEN ACCESS_TOKEN]

        expect(JwtHelper.decode(response.cookies['ACCESS_TOKEN'])[:user_id]).to be_truthy
      end

      it 'existing user and existing identity' do
        identity = create(:developer_provider, :existing)
        set_access_token(identity.user)

        user_count = User.all.count
        identity_count = Identity::Identity.all.count

        get '/api/auth/developer/callback'

        expect(response).to have_http_status 302
        expect(response).to set_cookie %w[REFRESH_TOKEN ACCESS_TOKEN] # Old cookies overridden

        expect(User.all.count).to eq(user_count)
        expect(Identity::Identity.all.count).to eq(identity_count)
      end

      it 'existing user and a new identity' do
        user = create(:user)
        set_access_token(user)

        user_count = User.all.count
        identity_count = Identity::Identity.where('user_id = ?', user[:id]).count
        new_identity_count = identity_count + 1

        get '/api/auth/developer/callback'

        expect(response).to have_http_status 302
        expect(response).to set_cookie %w[REFRESH_TOKEN ACCESS_TOKEN] # Old cookies overridden

        expect(User.all.count).to eq(user_count)
        expect(Identity::Identity.where('user_id = ?', user[:id]).count).to eq(new_identity_count)
      end

      it 'new user and a new extern identity' do
        create(:developer_provider, :new)

        user_count = User.all.count
        identity_count = Identity::Identity.developer.count

        get '/api/auth/developer/callback'

        expect(response).to have_http_status 302
        expect(response).to set_cookie %w[REFRESH_TOKEN ACCESS_TOKEN] # Old cookies overridden

        expect(User.all.count).not_to eq(user_count)
        expect(Identity::Identity.developer.count).not_to eq(identity_count)
      end

      it 'valid jwt token, but invalid user_id (association gone wrong?)' do
        create(:developer_provider, :new)
        set_access_token_with_invalid_user

        get '/api/auth/developer/callback'

        expect(response.status).to eq(404)
        expect(response).not_to set_cookie %w[REFRESH_TOKEN ACCESS_TOKEN]
      end

      it 'expired access token for callback' do
        set_expired_access_token
        get '/api/auth/developer/callback'

        # The expired token should not matter in this case, it will be reset anyway
        # Therefore this should redirect the user
        expect(response).to have_http_status 302
        expect(response).to set_cookie %w[REFRESH_TOKEN ACCESS_TOKEN]
      end
    end

    context 'logged in' do
      it 'testing the json response of a sign_in' do
        get '/api/auth/developer/callback'
        expect(response).to set_cookie %w[REFRESH_TOKEN ACCESS_TOKEN]

        cookies['ACCESS_TOKEN'] = response.cookies['ACCESS_TOKEN']
        get '/api/user'

        expect(response).not_to set_cookie ['REFRESH_TOKEN']

        json_data = JSON.parse(response.body)
        expect(json_data['roles']).to eq(['validated'])
      end
    end

    context 'logging out' do
      it 'first logging in then logging out' do
        get '/api/auth/developer/callback'
        expect(response).to set_cookie %w[REFRESH_TOKEN ACCESS_TOKEN]

        delete '/api/auth/sign_out'
        expect(response).to have_http_status 200
        expect(response).to delete_cookie %w[REFRESH_TOKEN ACCESS_TOKEN]
      end

      it 'already logged in' do
        get '/api/auth/developer/callback'
        expect(response).to set_cookie %w[REFRESH_TOKEN ACCESS_TOKEN]

        delete '/api/auth/sign_out'
        expect(response).to have_http_status 200
        expect(response).to delete_cookie %w[REFRESH_TOKEN ACCESS_TOKEN]

        get '/api/user'
        expect(response).not_to set_cookie %w[REFRESH_TOKEN ACCESS_TOKEN]

        json_data = JSON.parse(response.body)
        expect(json_data['roles']).to eq(['guest'])
      end
    end
  end

  context 'jwt' do
    it 'expired' do
      set_expired_access_token
      get '/api/user'

      expect(response).to delete_cookie ['ACCESS_TOKEN']
    end
  end
end
