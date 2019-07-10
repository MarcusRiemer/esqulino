
require 'rails_helper'

RSpec.describe "auth controller" do

  before(:each) { create(:user, :guest) }

  json_headers = { "CONTENT_TYPE" => "application/json" }

  let(:identity_params){{
    :email => "blattwerkzeug@web.de",
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
      expect(JwtHelper.decode(response.cookies['JWT-TOKEN'])[:user_id]).to be_truthy  
      expect(response.status).to eq(302)
    end

    it "logging in with existing user and existing identity" do
      identity = create(:developer_provider, :existing)
      set_jwt(identity.user)

      user_count = User.all.count
      identity_count = Identity.all.count

      get '/api/auth/developer/callback'

      expect(User.all.count).to eq(user_count)
      expect(Identity.all.count).to eq(identity_count)
    end

    it "logging in with existing user and a new identity" do
      set_jwt(user)

      user_count = User.all.count
      identity_count = Identity.where("user_id = ?", user[:id]).count
      new_identity_count = identity_count + 1

      get '/api/auth/developer/callback'
      expect(User.all.count).to eq(user_count)
      expect(Identity.where("user_id = ?", user[:id]).count).to eq(new_identity_count)
    end

    it "logging in with new user and a new extern identity" do
      identity = create(:google_provider, :new)

      user_count = User.all.count
      identity_count = Identity.developer.count
  
      get '/api/auth/developer/callback'
      expect(User.all.count).not_to eq(user_count)
      expect(Identity.developer.count).not_to eq(identity_count)
    end

    it "logging out user with developer strategy" do
      get '/api/auth/developer/callback'
      expect(response.cookies['JWT-TOKEN']).to be_truthy  

      delete '/api/auth/sign_out'
      expect(cookies['JWT-TOKEN']).to eq("")
      expect(response.status).to eq(200)
    end


    it "logging in with an valid jwt token, but invalid user_id" do
      identity = create(:google_provider, :new)
      set_jwt_with_invalid_user()

      get '/api/auth/developer/callback'
      expect(response.status).to eq(401)
    end

    it "logging in with an expired jwt token" do
      set_expired_jwt()
      get '/api/auth/developer/callback'
      expect(response.status).to eq(401)
    end

    it "testing the json response of a sign_in" do
      get '/api/auth/developer/callback'
  
      expect(response.cookies['JWT-TOKEN']).to be_truthy  
      
      cookies["JWT-TOKEN"] = response.cookies['JWT-TOKEN']

      get '/api/user'
      json_data = JSON.parse(response.body)
      expect(json_data["roles"]).to eq(["user"])
    end
  
    it "logging out" do
      get '/api/auth/developer/callback'

  
      expect(response.cookies['JWT-TOKEN']).to be_truthy  
  
      delete '/api/auth/sign_out'
  
      expect(cookies['JWT-TOKEN']).to eq("")
  
      get '/api/user'
      json_data = JSON.parse(response.body)
      expect(json_data["roles"]).to eq(["guest"])
    end

    it "account linking with developer" do
      identity = create(:identity_provider, :new)
      set_jwt(identity.user)
  
      count_identity = Identity.where(user_id: identity.user_id).count
  
      get '/api/auth/developer/callback'
  
      expect(Identity.where(user_id: identity.user_id).count).to eq(count_identity + 1)
    end

    it "account linking with already linked identity ( developer )" do
      identity = create(:developer_provider, :existing)
      get '/api/auth/developer/callback'

      set_jwt(identity.user)
      count_identity_by_user_id = Identity.where(user_id: user[:id]).count
      count_identities = Identity.all.count
  
      get '/api/auth/developer/callback'
  
      expect(Identity.where(user_id: user[:id]).count).to eq(count_identity_by_user_id)
      expect(Identity.all.count).to eq(count_identities)
    end
  end

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
    expect(Identity.all.first.confirmed?).to eq(false)
  end

  it "registering identity with existing uid" do
    create(:identity_provider, :existing, uid: identity_params[:email])

    identity_count = Identity.all.count

    post '/api/auth/identity/register',
        :headers => json_headers,
        :params => identity_params.to_json

    expect(Identity.all.count).to eq(identity_count)
  end

  it "logging in with email and password" do
    create(:identity_provider, :existing)

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
  #   create(:identity_provider, :new)

  #   identity_count = Identity.all.count

  #   identity_params[:username] = ""

  #   post '/api/auth/identity/register',
  #       :headers => json_headers,
  #       :params => identity_params.to_json

  #   expect(Identity.all.count).to eq(identity_count)
  # end


  it "logging in with email and wrong password" do
    create(:identity_provider, :existing)

    identity_params[:password] = "wrong"

    post '/api/auth/identity',
      :headers => json_headers,
      :params => identity_params.to_json

    expect(response.status).to eq(401)
    expect(response.cookies['JWT-TOKEN']).to be_nil 
  end

  it "logging in with wrong email and password" do
    create(:identity_provider, :existing)

    identity_params[:email] = "wrong"

    post '/api/auth/identity',
      :headers => json_headers,
      :params => identity_params.to_json

    expect(response.status).to eq(401)
    expect(response.cookies['JWT-TOKEN']).to be_nil 
  end


  it "account linking with identity" do
    identity = create(:identity_provider, :new)
    set_jwt(identity.user)

    count_identity = Identity.where(user_id: identity.user_id).count

    post '/api/auth/identity/register',
      :headers => json_headers,
      :params => identity_params.to_json

    expect(Identity.where(user_id: identity.user_id).count).to eq(count_identity + 1)
  end


  it "account linking with identity and existing extern provider" do
    identity = create(:developer_provider, :new)
    set_jwt(identity.user)

    count_identity = Identity.where(user_id: identity.user_id).count

    expect(identity.user[:email]).to be_nil

    post '/api/auth/identity/register',
      :headers => json_headers,
      :params => identity_params.to_json


    expect(identity.user[:email]).to eq(identity_params[:uid])
    expect(Identity.where(user_id: identity.user_id).count).to eq(count_identity + 1)
  end


  it "account linking with already linked identity ( identity )" do
    identity = create(:identity_provider, :existing)

    count_identity_by_user_id = Identity.where(user_id: identity.user_id).count
    count_identities = Identity.all.count

    post '/api/auth/identity/register',
      :headers => json_headers,
      :params => identity_params.to_json


    expect(Identity.where(user_id: identity.user_id).count).to eq(count_identity_by_user_id)
    expect(Identity.all.count).to eq(count_identities)
  end

  it "add a new email to an logged in user" do
    identity = create(:identity_provider, :new)
    set_jwt(identity.user)

    count_identity_by_user_id = Identity.where(user_id: identity.user_id).count
    count_identities = Identity.all.count

    post '/api/auth/identity/register',
      :headers => json_headers,
      :params => identity_params.to_json

    expect(Identity.where(user_id: identity.user_id).count).to eq(count_identity_by_user_id + 1)
    expect(Identity.all.count).to eq(count_identities + 1)
  end
end
