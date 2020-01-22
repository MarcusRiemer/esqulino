require 'rails_helper'

RSpec.describe "auth controller" do
  json_headers = { "CONTENT_TYPE" => "application/json" }

  before(:each) { create(:user, :guest) }
  let(:identity_params){{
    :email => "blattwerkzeug@web.de",
    :password => "12345678",
    :username => "Blattwerkzeug"
  }}

  describe "developer provider with default values" do
    before(:all) do
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

    context "logging in" do
      it "valid response" do
        get '/api/auth/developer/callback'
        expect(response).to have_http_status 302
        expect(response).to set_cookie ["REFRESH_TOKEN", "ACCESS_TOKEN"]

        expect(JwtHelper.decode(response.cookies['ACCESS_TOKEN'])[:user_id]).to be_truthy
      end

      it "existing user and existing identity" do
        identity = create(:developer_provider, :existing)
        set_access_token(identity.user)

        user_count = User.all.count
        identity_count = Identity::Identity.all.count

        get '/api/auth/developer/callback'

        expect(response).to have_http_status 302
        expect(response).to set_cookie ["REFRESH_TOKEN", "ACCESS_TOKEN"] # Old cookies overridden

        expect(User.all.count).to eq(user_count)
        expect(Identity::Identity.all.count).to eq(identity_count)
      end

      it "existing user and a new identity" do
        user = create(:user)
        set_access_token(user)

        user_count = User.all.count
        identity_count = Identity::Identity.where("user_id = ?", user[:id]).count
        new_identity_count = identity_count + 1

        get '/api/auth/developer/callback'

        expect(response).to have_http_status 302
        expect(response).to set_cookie ["REFRESH_TOKEN", "ACCESS_TOKEN"] # Old cookies overridden

        expect(User.all.count).to eq(user_count)
        expect(Identity::Identity.where("user_id = ?", user[:id]).count).to eq(new_identity_count)
      end

      it "new user and a new extern identity" do
        identity = create(:google_provider, :new)

        user_count = User.all.count
        identity_count = Identity::Identity.developer.count

        get '/api/auth/developer/callback'

        expect(response).to have_http_status 302
        expect(response).to set_cookie ["REFRESH_TOKEN", "ACCESS_TOKEN"] # Old cookies overridden

        expect(User.all.count).not_to eq(user_count)
        expect(Identity::Identity.developer.count).not_to eq(identity_count)
      end

      it "valid jwt token, but invalid user_id (association gone wrong?)" do
        identity = create(:google_provider, :new)
        set_access_token_with_invalid_user()

        get '/api/auth/developer/callback'

        expect(response.status).to eq(404)
        expect(response).not_to set_cookie ["REFRESH_TOKEN", "ACCESS_TOKEN"]
      end

      it "expired access token for callback" do
        set_expired_access_token()
        get '/api/auth/developer/callback'

        # The expired token should not matter in this case, it will be reset anyway
        # Therefore this should redirect the user
        expect(response).to have_http_status 302
        expect(response).to set_cookie ["REFRESH_TOKEN", "ACCESS_TOKEN"]
      end
    end

    context "logged in" do
      it "testing the json response of a sign_in" do
        get '/api/auth/developer/callback'
        expect(response).to set_cookie ["REFRESH_TOKEN", "ACCESS_TOKEN"]

        cookies['ACCESS_TOKEN'] = response.cookies['ACCESS_TOKEN']
        get '/api/user'

        expect(response).not_to set_cookie ["REFRESH_TOKEN"]

        json_data = JSON.parse(response.body)
        expect(json_data["roles"]).to eq(["user"])
      end
    end

    context "logging out" do
      it "first logging in then logging out" do
        get '/api/auth/developer/callback'
        expect(response).to set_cookie ["REFRESH_TOKEN", "ACCESS_TOKEN"]

        delete '/api/auth/sign_out'
        expect(response).to have_http_status 200
        expect(response).to delete_cookie ["REFRESH_TOKEN", "ACCESS_TOKEN"]
      end

      it "already logged in" do
        get '/api/auth/developer/callback'
        expect(response).to set_cookie ["REFRESH_TOKEN", "ACCESS_TOKEN"]

        delete '/api/auth/sign_out'
        expect(response).to have_http_status 200
        expect(response).to delete_cookie ["REFRESH_TOKEN", "ACCESS_TOKEN"]

        get '/api/user'
        expect(response).not_to set_cookie ["REFRESH_TOKEN", "ACCESS_TOKEN"]

        json_data = JSON.parse(response.body)
        expect(json_data["roles"]).to eq(["guest"])
      end
    end

    context "account linking" do
      it "succesfully" do
        identity = create(:identity_provider, :new)
        set_access_token(identity.user)

        count_identity = Identity::Identity.where(user_id: identity.user_id).count

        get '/api/auth/developer/callback'
        expect(response).to set_cookie ["REFRESH_TOKEN", "ACCESS_TOKEN"]
        expect(Identity::Identity.where(user_id: identity.user_id).count).to eq(count_identity + 1)
      end

      it "already linked identity ( developer )" do
        identity = create(:developer_provider, :existing)
        get '/api/auth/developer/callback'

        set_access_token(identity.user)
        count_identity_by_user_id = Identity::Identity.where(user_id: identity.user_id).count
        count_identities = Identity::Identity.all.count

        get '/api/auth/developer/callback'
        expect(Identity::Identity.where(user_id: identity.user_id).count)
          .to eq(count_identity_by_user_id)
        expect(Identity::Identity.all.count).to eq(count_identities)
      end
    end

    context "jwt" do
      it "expired" do
        set_expired_access_token()
        get '/api/user'

        expect(response.cookies['ACCESS_TOKEN']).to be_nil
        # expect(response).to delete_cookie ["ACCESS_TOKEN"]
      end
    end
  end

  it "new identity with new user" do
    user_count = User.all.count
    identity_count = Identity::Identity.all.count

    post '/api/auth/identity/register',
      :headers => json_headers,
      :params => identity_params.to_json

    expect(User.all.count).to_not eq(user_count)
    expect(Identity::Identity.all.count).to_not eq(identity_count)
  end

  it "identity with password" do
    post '/api/auth/identity/register',
        :headers => json_headers,
        :params => identity_params.to_json

    expect(Identity::Identity.all.first[:uid]).to eq(identity_params[:email])
    expect(Identity::Identity.all.first.confirmed?).to eq(false)
  end


  it "identity with existing uid" do
    create(:identity_provider, :existing, uid: identity_params[:email])

    identity_count = Identity::Identity.all.count

    post '/api/auth/identity/register',
        :headers => json_headers,
        :params => identity_params.to_json

    expect(Identity::Identity.all.count).to eq(identity_count)
  end



  it "registering identity with an empty password" do
    create(:identity_provider, :new)

    identity_count = Identity::Identity.all.count

    identity_params[:password] = ""

    post '/api/auth/identity/register',
        :headers => json_headers,
        :params => identity_params.to_json

    json_data = JSON.parse(response.body)

    expect(json_data["message"]).to eq("Password can't be blank")
    expect(Identity::Identity.all.count).to eq(identity_count)
  end

  it "registering identity with length < 6" do
    create(:identity_provider, :new)

    identity_count = Identity::Identity.all.count

    identity_params[:password] = "12345"

    post '/api/auth/identity/register',
        :headers => json_headers,
        :params => identity_params.to_json

    json_data = JSON.parse(response.body)

    expect(json_data["message"]).to eq("Password is too short (minimum is 6 characters)")
    expect(Identity::Identity.all.count).to eq(identity_count)
  end

  it "registering identity with an empty username" do
    create(:identity_provider, :new)

    identity_count = Identity::Identity.all.count

    identity_params[:username] = ""

    post '/api/auth/identity/register',
        :headers => json_headers,
        :params => identity_params.to_json

    expect(Identity::Identity.all.count).to eq(identity_count)
  end

  it "registering identity with an invalid username" do
    create(:identity_provider, :new)

    identity_count = Identity::Identity.all.count

    identity_params[:username] = "   "

    post '/api/auth/identity/register',
        :headers => json_headers,
        :params => identity_params.to_json

    expect(Identity::Identity.all.count).to eq(identity_count)
  end


  it "with identity" do
    identity = create(:identity_provider, :new)
    set_access_token(identity.user)

    count_identity = Identity::Identity.where(user_id: identity.user_id).count

    post '/api/auth/identity/register',
      :headers => json_headers,
      :params => identity_params.to_json

    expect(Identity::Identity.where(user_id: identity.user_id).count).to eq(count_identity + 1)
  end


  it "with identity and existing extern provider" do
    identity = create(:developer_provider, :new)
    set_access_token(identity.user)

    count_identity = Identity::Identity.where(user_id: identity.user_id).count

    expect(identity.user[:email]).to be_nil

    post '/api/auth/identity/register',
      :headers => json_headers,
      :params => identity_params.to_json

    expect(Identity::Identity.where(user_id: identity.user_id).count).to eq(count_identity + 1)
  end


  it "with already linked identity ( identity )" do
    identity = create(:identity_provider, :existing)

    count_identity_by_user_id = Identity::Identity.where(user_id: identity.user_id).count
    count_identities = Identity::Identity.all.count

    post '/api/auth/identity/register',
      :headers => json_headers,
      :params => identity_params.to_json


    expect(Identity::Identity.where(user_id: identity.user_id).count).to eq(count_identity_by_user_id)
    expect(Identity::Identity.all.count).to eq(count_identities)
  end


  it "with email and password" do
    create(:identity_provider, :existing)

    post '/api/auth/identity',
      :headers => json_headers,
      :params => identity_params.to_json

    expect(response.cookies['ACCESS_TOKEN']).to be_truthy
  end

  it "with email and wrong password" do
    create(:identity_provider, :existing)

    identity_params[:password] = "wrong"

    post '/api/auth/identity',
      :headers => json_headers,
      :params => identity_params.to_json

    expect(response.status).to eq(401)
    expect(response.cookies['ACCESS_TOKEN']).to be_nil
  end

  it "with wrong email and password" do
    create(:identity_provider, :existing)

    identity_params[:email] = "wrong"

    post '/api/auth/identity',
      :headers => json_headers,
      :params => identity_params.to_json

    expect(response.status).to eq(401)
    expect(response.cookies['ACCESS_TOKEN']).to be_nil
  end


  it "new email to an logged in user" do
    identity = create(:identity_provider, :new)
    set_access_token(identity.user)

    count_identity_by_user_id = Identity::Identity.where(user_id: identity.user_id).count
    count_identities = Identity::Identity.all.count

    post '/api/auth/identity/register',
      :headers => json_headers,
      :params => identity_params.to_json

    expect(Identity::Identity.where(user_id: identity.user_id).count)
      .to eq(count_identity_by_user_id + 1)
    expect(Identity::Identity.all.count).to eq(count_identities + 1)
  end
end
