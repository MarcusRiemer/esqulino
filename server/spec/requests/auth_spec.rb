
require 'rails_helper'

RSpec.fdescribe "auth controller" do

  json_headers = { "CONTENT_TYPE" => "application/json" }

  let(:identity_params){{ 
    :email => "blattwerkzeug@web.de",
    # TODO-TOM ASK MARCUS 
    :password => "12345678",
    :username => "Blattwerkzeug"
  }}

  let(:user) { create(:user) }

  # TODO developer simulate get and post 
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
      expect(Auth.decode(response.cookies['JWT-TOKEN'])[:user_id]).to be_truthy  
      expect(response.status).to eq(302)
    end

    it "logging in with existing user and existing identity" do
      identity = create(:identity, :existing_developer, user_id: user[:id])
      cookies['JWT-TOKEN'] = Auth.encode({user_id: user[:id]})

      user_count = User.all.count
      identity_count = Identity.all.count

      get '/api/auth/developer/callback'

      expect(User.all.count).to eq(user_count)
      expect(Identity.all.count).to eq(identity_count)
    end

    it "logging in with existing user and a new identity" do
      cookies['JWT-TOKEN'] = Auth.encode({user_id: user[:id]})

      user_count = User.all.count
      identity_count = Identity.where("user_id = ?", user[:id]).count
      new_identity_count = identity_count + 1

      get '/api/auth/developer/callback'
      expect(User.all.count).to eq(user_count)
      expect(Identity.where("user_id = ?", user[:id]).count).to eq(new_identity_count)
    end

    it "logging in with new user and a new extern identity" do
      identity = create(:identity, :google_provider, user_id: user[:id])

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
      expect(cookies['JWT-TOKEN']).to eq("")
      expect(response.status).to eq(200)
    end


    it "logging in with an valid jwt token, but invalid user_id" do
      identity = create(:identity, :google_provider, user_id: user[:id])
      cookies['JWT-TOKEN'] = Auth.encode({user_id: "12121212"})

      get '/api/auth/developer/callback'
      expect(response.status).to eq(401)
    end

    it "logging in with an invalid jwt token" do
      cookies['JWT-TOKEN'] = Auth.encode({user_id: "1337"}, 0.second.from_now)
      get '/api/auth/developer/callback'
      expect(response.status).to eq(401)
    end

    it "testing the json response of a sign_in" do
      get '/api/auth/developer/callback'
  
      expect(response.cookies['JWT-TOKEN']).to be_truthy  
  
      get '/api/user'
      json_data = JSON.parse(response.body)
      expect(json_data["loggedIn"]).to eq(true)
    end
  
    it "logging out" do
      get '/api/auth/developer/callback'
  
      expect(response.cookies['JWT-TOKEN']).to be_truthy  
  
      delete '/api/auth/sign_out'
  
      expect(cookies['JWT-TOKEN']).to eq("")  
  
      get '/api/user'
      json_data = JSON.parse(response.body)
      expect(json_data["loggedIn"]).to eq(false)
    end

    it "account linking with developer" do
      create(:identity, :identity_provider, user_id: user[:id])
      cookies['JWT-TOKEN'] = Auth.encode({user_id: user[:id]}, 1.hour.from_now)
  
      count_identity = Identity.where(user_id: user[:id]).count
  
      get '/api/auth/developer/callback'
  
      expect(Identity.where(user_id: user[:id]).count).to eq(count_identity + 1)
    end

    it "account linking with already linked identity ( developer )" do
      get '/api/auth/developer/callback'
      cookies['JWT-TOKEN'] = Auth.encode({user_id: user[:id]}, 1.hour.from_now)
      count_identity_by_user_id = Identity.where(user_id: user[:id]).count
      count_identities = Identity.all.count
  
      get '/api/auth/developer/callback'
  
      expect(Identity.where(user_id: user[:id]).count).to eq(count_identity_by_user_id)
      expect(Identity.all.count).to eq(count_identities)
    end
  end

  # TODO-TOM ASK MARCUS WHY DESCRIBE IS NIL

  it "registering new identity with new user" do
    user_count = User.all.count
    post '/api/auth/identity/register',
      :headers => json_headers,
      :params => identity_params.to_json

    identity = Identity.all.first
    expect(User.all.count).to_not eq(user_count)
    expect(User.all.last[:email]).to eq(identity[:uid])
  end

  it "registering identity with password" do
    post '/api/auth/identity/register',
        :headers => json_headers,
        :params => identity_params.to_json
    
    expect(Identity.all.first[:uid]).to eq(identity_params[:email])
    expect(Identity.all.first[:data]["confirmed"]).to eq(false)
  end

  it "registering identity with existing uid" do
    create(:identity, :identity_provider, uid: identity_params[:email], user_id: user[:id])

    identity_count = Identity.all.count

    post '/api/auth/identity/register',
        :headers => json_headers,
        :params => identity_params.to_json

    expect(Identity.all.count).to eq(identity_count)
  end

  it "logging in with email and password" do
    create(:identity, :existing_identity, user_id: user[:id])

    post '/api/auth/identity',
      :headers => json_headers,
      :params => identity_params.to_json

    expect(response.cookies['JWT-TOKEN']).to be_truthy 
  end

  # TODO-TOM NEEDS SERVER VALIDATION 
  # it "registering identity with an empty password" do
  #   create(:identity, :identity_provider, user_id: user[:id])

  #   identity_count = Identity.all.count

  #   identity_params[:password] = ""

  #   post '/api/auth/identity/register',
  #       :headers => json_headers,
  #       :params => identity_params.to_json

  #   expect(Identity.all.count).to eq(identity_count)
  # end

  # it "registering identity with an empty username" do
  #   create(:identity, :identity_provider, user_id: user[:id])

  #   identity_count = Identity.all.count

  #   identity_params[:username] = ""

  #   post '/api/auth/identity/register',
  #       :headers => json_headers,
  #       :params => identity_params.to_json

  #   expect(Identity.all.count).to eq(identity_count)
  # end


  it "logging in with email and wrong password" do
    create(:identity, :existing_identity, user_id: user[:id])

    identity_params[:password] = "wrong"

    post '/api/auth/identity',
      :headers => json_headers,
      :params => identity_params.to_json

    expect(response.status).to eq(401)
    expect(response.cookies['JWT-TOKEN']).to be_nil 
  end

  it "logging in with wrong email and password" do
    create(:identity, :existing_identity, user_id: user[:id])

    identity_params[:email] = "wrong"

    post '/api/auth/identity',
      :headers => json_headers,
      :params => identity_params.to_json

    expect(response.status).to eq(401)
    expect(response.cookies['JWT-TOKEN']).to be_nil 
  end


  it "account linking with identity" do
    create(:identity, :identity_provider, user_id: user[:id])
    cookies['JWT-TOKEN'] = Auth.encode({user_id: user[:id]}, 1.hour.from_now)

    count_identity = Identity.where(user_id: user[:id]).count

    post '/api/auth/identity/register',
      :headers => json_headers,
      :params => identity_params.to_json

    expect(Identity.where(user_id: user[:id]).count).to eq(count_identity + 1)
  end


  it "account linking with identity and existing extern provider" do
    create(:identity, :existing_developer, user_id: user[:id])
    cookies['JWT-TOKEN'] = Auth.encode({user_id: user[:id]}, 1.hour.from_now)

    count_identity = Identity.where(user_id: user[:id]).count

    expect(user[:email]).to be_nil

    post '/api/auth/identity/register',
      :headers => json_headers,
      :params => identity_params.to_json


    expect(user[:email]).to eq(identity_params[:uid])
    expect(Identity.where(user_id: user[:id]).count).to eq(count_identity + 1)
  end


  it "account linking with already linked identity ( identity )" do
    create(:identity, :existing_identity, user_id: user[:id])

    count_identity_by_user_id = Identity.where(user_id: user[:id]).count
    count_identities = Identity.all.count

    post '/api/auth/identity/register',
      :headers => json_headers,
      :params => identity_params.to_json


    expect(Identity.where(user_id: user[:id]).count).to eq(count_identity_by_user_id)
    expect(Identity.all.count).to eq(count_identities)
  end

  it "add a new email to an logged in user" do
    create(:identity, :identity_provider, user_id: user[:id])
    cookies['JWT-TOKEN'] = Auth.encode({user_id: user[:id]}, 1.hour.from_now)

    count_identity_by_user_id = Identity.where(user_id: user[:id]).count
    count_identities = Identity.all.count

    post '/api/auth/identity/register',
      :headers => json_headers,
      :params => identity_params.to_json

    expect(Identity.where(user_id: user[:id]).count).to eq(count_identity_by_user_id + 1)
    expect(Identity.all.count).to eq(count_identities + 1)

  end

end
