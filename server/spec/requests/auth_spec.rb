
require 'rails_helper'

RSpec.fdescribe "auth controller" do

  # TODO developer simulate get and post 
  # TODO user and identity exists, user with new identity and new user
  describe "developer strategy with default values" do
    before(:each) do
      OmniAuth.config.test_mode = true
      OmniAuth.config.mock_auth[:developer] = OmniAuth::AuthHash.new({
        :provider => 'developer',
        :info => {
          :name => 'Tom',
          :email => 'developer@blattwerkzeug.de'
        },
        :uid => 'developer@blattwerkzeug.de'
      })
    end

    it "logging in with developer strategy" do
      get '/api/auth/developer/callback'
      expect(response.cookies['JWT-TOKEN']).to be_truthy  
      # expect(Auth.decode(response.cookies['JWT-TOKEN'])[:user_id]).to be_truthy  
      expect(response.status).to eq(302)
    end

    it "logging in with existing user and existing identity" do
      user = User.create(display_name: "Blattwerkzeug")
      identity = Identity.create(user: user, provider: "developer", uid: "developer@blattwerkzeug.de")
      cookies['JWT-TOKEN'] = Auth.encode({user_id: user[:id]})

      user_count = User.all.count
      identity_count = Identity.all.count

      get '/api/auth/developer/callback'
      expect(User.all.count).to eq(user_count)
      expect(Identity.all.count).to eq(identity_count)
    end

    it "logging in with existing user and a new identity" do
      user = User.create(display_name: "Blattwerkzeug")
      cookies['JWT-TOKEN'] = Auth.encode({user_id: user[:id]})

      user_count = User.all.count
      identity_count = Identity.where("user_id = ?", user[:id]).count
      new_identity_count = identity_count + 1

      get '/api/auth/developer/callback'
      expect(User.all.count).to eq(user_count)
      expect(Identity.where("user_id = ?", user[:id]).count).to eq(new_identity_count)
    end

    it "logging in with new user and a new identity" do
      user = User.create(display_name: "Blattwerkzeug")
      identity = Identity.create(user: user, provider: "google", uid: "developer@blattwerkzeug.de")

      user_count = User.all.count
      identity_count = Identity.all.count

      get '/api/auth/developer/callback'
      expect(User.all.count).not_to eq(user_count)
      expect(Identity.all.count).not_to eq(identity_count)
    end

    it "logging out user with developer strategy" do
      get '/api/auth/developer/callback'
      expect(response.cookies['JWT-TOKEN']).to be_truthy  

      delete '/api/auth/sign_out'
      expect(response.cookies['JWT-TOKEN']).to be_nil
      expect(response.status).to eq(200)
    end


    it "logging in with an valid jwt token, but invalid user_id" do
      user = User.create(display_name: "Blattwerkzeug")
      identity = Identity.create(user: user, provider: "google", uid: "developer@blattwerkzeug.de")
      cookies['JWT-TOKEN'] = Auth.encode({user_id: "12121212"})

      get '/api/auth/developer/callback'
      expect(response.status).to eq(401)
    end

    it "logging in with an invalid jwt token" do
      cookies['JWT-TOKEN'] = Auth.encode({user_id: "1337"}, 0.second.from_now)
      get '/api/auth/developer/callback'
      expect(response.status).to eq(401)
    end
  end
  
  

  # it "testing the json response of a sign_in" do
  #   get '/api/auth/developer/callback'
  #   json_data = JSON.parse(response.body)
  #   expect(json_data['role']).to eq('user')  
  # end
end
