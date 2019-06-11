
require 'rails_helper'

RSpec.fdescribe "identities controller" do
  json_headers = { "CONTENT_TYPE" => "application/json" }

  let(:user) { create(:user) }

  it "e-mail confirmation" do
    identity = create(:identity, :identity_provider, user_id: user[:id])
    confirmed = identity[:data]["confirmed"]

    expect(confirmed).to eq(false)  

    get "/api/identities/confirmation/#{identity[:data]["verify_token"]}"

    expect(Identity.all.first[:data]["confirmed"]).to eq(true)  
  end

  it "e-mail confirmation with wrong token" do
    identity = create(:identity, :identity_provider, user_id: user[:id])
    confirmed = identity[:data]["confirmed"]

    expect(confirmed).to eq(false)  

    get "/api/identities/confirmation/123121212"

    expect(Identity.all.first[:data]["confirmed"]).to eq(false)
  end

  it "password changing" do
    identity = create(:identity, :existing_identity, user_id: user[:id])

    cookies['JWT-TOKEN'] = Auth.encode({user_id: user[:id]})

    put '/api/identities/change_password',
      :headers => json_headers,
      :params => {
        currentPassword: identity[:data]["password"],
        newPassword: "newPassword"
      }.to_json

    expect(Identity.all.first.password_eql?("newPassword"))
  end


  it "password changing with invalid current password" do
    identity = create(:identity, :existing_identity, user_id: user[:id])

    cookies['JWT-TOKEN'] = Auth.encode({user_id: user[:id]})

    put '/api/identities/change_password',
      :headers => json_headers,
      :params => {
        currentPassword: "12121212",
        newPassword: "newPassword"
      }.to_json

    expect(Identity.all.first[:data]["password"]).to eq(identity[:data]["password"])
  end

  it "resetting password" do
    identity = create(:identity, :existing_identity, user_id: user[:id])

    post "/api/identities/reset_password_mail",
      :headers => json_headers,
      :params => {
        email: identity[:uid]
      }.to_json

    token_arrived_identity = Identity.all.first

    put "/api/identities/reset_password",
      :headers => json_headers,
      :params => {
        email: token_arrived_identity[:uid],
        token: token_arrived_identity[:data]["password_reset_token"],
        password: "reseted_password"
      }.to_json

    expect(Identity.all.first.password_eql?("reseted_password")).to be_truthy
  end

  it "resetting password with wrong email" do
    identity = create(:identity, :existing_identity, user_id: user[:id])

    post "/api/identities/reset_password_mail",
      :headers => json_headers,
      :params => {
        email: "wrong@email.de"
      }.to_json

    json_data = JSON.parse(response.body)
    expect(json_data["error"]).to eq("e-mail not found")
    expect(response.status).to eq(401)
  end

  it "resetting password with invalid token" do
    identity = create(:identity, :existing_identity, user_id: user[:id])


    post "/api/identities/reset_password_mail",
      :headers => json_headers,
      :params => {
        email: identity[:uid]
      }.to_json

    token_arrived_identity = Identity.all.first

    put "/api/identities/reset_password",
      :headers => json_headers,
      :params => {
        email: token_arrived_identity[:uid],
        token: "invalid-token",
        password: "reseted_password"
      }.to_json

    json_data = JSON.parse(response.body)
    expect(json_data["error"]).to eq("token not valid")
    expect(response.status).to eq(401)
  end


  it "resetting password with expired token" do
    identity = create(:identity, :existing_identity, user_id: user[:id])

    put "/api/identities/reset_password",
      :headers => json_headers,
      :params => {
        email: identity[:uid],
        token: identity[:data]["password_reset_token"],
        password: "reseted_password"
      }.to_json

    json_data = JSON.parse(response.body)
    expect(json_data["error"]).to eq("token expired")
    expect(response.status).to eq(401)

  end
end