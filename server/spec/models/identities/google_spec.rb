require 'rails_helper'

RSpec.describe Identity::Google, type: :model do
  it "has proper client information" do
    expected_info = {
      name: "Google",
      url_name: "google_oauth2",
      icon: "fa-google",
      color: "FireBrick"
    }
    expect(Identity::Google.client_information).to eq(expected_info)
  end

  it "can't be persisted without parameters" do
    a = Identity::Google.new
    expect(a.validate).to eq false
  end

  it "can be created from an auth hash" do
    u = create(:user)
    auth = {
      :provider => "google",
      :credentials => {
        "token" => "secret",
        "expires" => true,
        "expires_at" => 1570803034 # Expired
      },
      :info => {
        "name" => "Marcus Riemer",
        "email" => "dasgurke@gmail.com",
        "image" => "https://lh3.googleusercontent.com/a-/AAuE7mej5ghaodkis09YsvJrlzSicMDq_wmZT4MCBJ0",
        "last_name" => "Riemer",
        "first_name" => "Marcus",
        "email_verified" => true,
        "unverified_email": "dasgurke@gmail.com"
      }
    }
    i = Identity::Google.create_with_auth(auth, u)

    expect(i.email).to eq "dasgurke@gmail.com"
    expect(i.confirmed?).to eq true
    expect(i.provider).to eq "google"
    expect(i.access_token).to eq "secret"
    expect(i.access_token_expired?).to eq true
  end

  it "has a working scope" do
    create(:google_provider)
    create(:developer_provider)

    expect(::Identity::Identity.google.length).to eq 1
  end

  it "can expire" do
    i = build(:google_provider, :expired)
    expect(i.access_token_expired?).to eq true
  end

  it "can be refeshed from Google" do
    i = build(:google_provider, :expired)

    # Response was issued like this from Google in a single test, lets
    # hope that issue was exemplary ...
    refresh_response = {
      "access_token"=>"new_secret",
      "expires_in"=>3261,
      "scope"=>"https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
      "token_type"=>"Bearer",
      "id_token"=>"secret"
    }.to_json

    # Whatever request is coming, it must include the old access_token
    stub_request(:post, Identity::Google::REFRESH_TOKEN_URL)
      .with(body: hash_including({ refresh_token: i.refresh_token }))
      .to_return(status: 200, body: refresh_response)

    i.refresh_access_token

    expect(i.access_token).to eq "new_secret"
    expect(i.access_token_expired?).to eq false
  end

  it "reports errors if refresh fails" do
    stub_request(:post, Identity::Google::REFRESH_TOKEN_URL)
      .to_return(status: 400, body: "Foo", headers: {})
    i = build(:google_provider, :existing)

    expect { i.refresh_access_token }.to raise_exception EsqulinoError::UnexpectedLogout
  end

  it "detects basic ill formed responses (missing expiration)" do
    refresh_response = {
      "access_token"=>"secret",
      # "expires_in"=>3261,
      "scope"=>"https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
      "token_type"=>"Bearer",
      "id_token"=>"secret"
    }.to_json

    stub_request(:post, Identity::Google::REFRESH_TOKEN_URL)
      .to_return(status: 200, body: refresh_response, headers: {})

    i = build(:google_provider, :existing)

    expect { i.refresh_access_token }.to raise_exception EsqulinoError::UnexpectedLogout
  end
end