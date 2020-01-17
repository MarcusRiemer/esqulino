require 'rails_helper'

RSpec.describe "identities controller (with Google Identity)" do
  json_headers = { "CONTENT_TYPE" => "application/json" }

  it "access_token expired, no refresh_token" do
    # This test must fall back to the guest user
    create(:user, :guest)

    user_identity = create(:google_provider, :existing)
    user = user_identity.user
    cookies['ACCESS_TOKEN'] = JwtHelper.encode({
                                                 "user_id" => user.id
                                               }, 300.seconds.before)

    get '/api/user'
    body = JSON.parse(response.body)

    aggregate_failures do
      expect(response).to have_http_status(400)
      expect(body["type"]).to eq "EsqulinoError::UnexpectedLogout"
      expect(response.cookies.keys).not_to include("REFRESH_TOKEN")
      expect(response.cookies["ACCESS_TOKEN"]).to be nil
    end
  end

  it "access_token expired, refresh_token not expired" do
    user_identity = create(:google_provider, :existing)
    user = user_identity.user
    cookies['ACCESS_TOKEN'] = JwtHelper.encode({
                                                 "user_id" => user.id
                                               }, 300.seconds.before)

    cookies['REFRESH_TOKEN'] = JwtHelper.encode({
                                                  "user_id" => user.id,
                                                  "identity_id" => user_identity.id,
                                                  "exp" => 300.seconds.after,
                                                  "iss": "localhost.localdomain:9292"
                                                })

    get '/api/user'
    body = JSON.parse(response.body)

    aggregate_failures do
      expect(response).to have_http_status(200)
      expect(body).to include("userId" => user.id, "displayName" => user.display_name)
      expect(response.cookies.keys).to include("ACCESS_TOKEN")
    end
  end

  it "access_token expired, refresh_token expired but googles token still valid" do
    user_identity = create(:google_provider, :existing)
    user = user_identity.user
    cookies['ACCESS_TOKEN'] = JwtHelper.encode({
                                                 "user_id" => user.id
                                               }, 300.seconds.before)

    cookies['REFRESH_TOKEN'] = JwtHelper.encode({
                                                  "user_id" => user.id,
                                                  "identity_id" => user_identity.id,
                                                  "exp" => 300.seconds.after,
                                                  "iss": "localhost.localdomain:9292"
                                                }, 300.seconds.before)

    get '/api/user'
    body = JSON.parse(response.body)

    aggregate_failures do
      expect(response).to have_http_status(200)
      expect(body).to include("userId" => user.id, "displayName" => user.display_name)
      expect(response.cookies.keys).to include("ACCESS_TOKEN", "REFRESH_TOKEN")
    end
  end

  it "access_token expired, refresh_token expired and googles token expired (but can be renewed)" do
    user_identity = create(:google_provider, :expired)
    user = user_identity.user
    cookies['ACCESS_TOKEN'] = JwtHelper.encode({
                                                 "user_id" => user.id
                                               }, 300.seconds.before)

    cookies['REFRESH_TOKEN'] = JwtHelper.encode({
                                                  "user_id" => user.id,
                                                  "identity_id" => user_identity.id,
                                                  "exp" => 180.seconds.before,
                                                  "iss": "localhost.localdomain:9292"
                                                }, 60.seconds.before)

    # Renewal of refresh token requires roundtrip to Google
    refresh_response = {
      "access_token"=>"new_secret",
      "expires_in"=>3261,
      "scope"=>"https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
      "token_type"=>"Bearer",
      "id_token"=>"secret"
    }.to_json

    stub_request(:post, "https://accounts.google.com/o/oauth2/token")
      .to_return(status: 200, body: refresh_response, headers: {})

    get '/api/user'
    body = JSON.parse(response.body)

    aggregate_failures do
      expect(response).to have_http_status(200)
      expect(body).to include("userId" => user.id, "displayName" => user.display_name)
      expect(response.cookies.keys).to include("ACCESS_TOKEN", "REFRESH_TOKEN")
    end
  end

  it "access_token expired, refresh_token expired and googles token expired (and can't be renewed)" do
    user_identity = create(:google_provider, :expired)
    user = user_identity.user
    cookies['ACCESS_TOKEN'] = JwtHelper.encode({
                                                 "user_id" => user.id
                                               }, 300.seconds.before)

    cookies['REFRESH_TOKEN'] = JwtHelper.encode({
                                                  "user_id" => user.id,
                                                  "identity_id" => user_identity.id,
                                                  "exp" => 180.seconds.before,
                                                  "iss": "localhost.localdomain:9292"
                                                }, 60.seconds.before)

    # Renewal of refresh token requires roundtrip to Google, but this fails
    stub_request(:post, "https://accounts.google.com/o/oauth2/token")
      .to_return(status: 400, body: "", headers: {})

    get '/api/user'
    body = JSON.parse(response.body)

    aggregate_failures do
      expect(response).to have_http_status(500)
      expect(body["type"]).to eq "EsqulinoError::UnexpectedLogout"
      expect(response.cookies.keys).not_to include("ACCESS_TOKEN", "REFRESH_TOKEN")
    end
  end
end