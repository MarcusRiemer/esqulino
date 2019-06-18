
require 'rails_helper'

RSpec.describe "identities controller" do
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

  it "saving password as hash" do
    identity = create(:identity, :identity_provider, password: "1234567", user_id: user[:id])
    expect(identity[:data]["password"]).to_not eq("1234567")
    expect(PasswordIdentity.all.first.password_eql?("1234567")).to be_truthy
  end

  it "password changing" do
    identity = create(:identity, :existing_identity, user_id: user[:id])

    cookies['JWT-TOKEN'] = Auth.encode({user_id: user[:id]})

    patch '/api/identities/change_password',
      :headers => json_headers,
      :params => {
        currentPassword: identity[:data]["password"],
        newPassword: "newPassword"
      }.to_json

    expect(PasswordIdentity.all.first.password_eql?("newPassword"))
  end

  it "password changing of all identities with password" do
    create(:identity, :identity_provider, user_id: user[:id])
    identity = create(:identity, :existing_identity, user_id: user[:id])

    cookies['JWT-TOKEN'] = Auth.encode({user_id: user[:id]})

    patch '/api/identities/change_password',
      :headers => json_headers,
      :params => {
        currentPassword: identity[:data]["password"],
        newPassword: "newPassword"
      }.to_json

    expect(Identity.all.count).to eq(2)
    expect(PasswordIdentity.all.first.password_eql?("newPassword"))
    expect(PasswordIdentity.all.last.password_eql?("newPassword"))
  end


  it "password changing with invalid current password" do
    identity = create(:identity, :existing_identity, user_id: user[:id])

    cookies['JWT-TOKEN'] = Auth.encode({user_id: user[:id]})

    patch '/api/identities/change_password',
      :headers => json_headers,
      :params => {
        currentPassword: "12121212",
        newPassword: "newPassword"
      }.to_json

    expect(PasswordIdentity.all.first[:data]["password"]).to eq(identity[:data]["password"])
  end

  it "resetting password" do
    identity = create(:identity, :existing_identity, user_id: user[:id])
    user.set_email(identity[:uid])

    post "/api/identities/reset_password_mail",
      :headers => json_headers,
      :params => {
        email: user[:email]
      }.to_json

    patch "/api/identities/reset_password",
      :headers => json_headers,
      :params => {
        token: PasswordIdentity.first[:data]["password_reset_token"],
        password: "reseted_password"
      }.to_json

    expect(PasswordIdentity.all.first.password_eql?("reseted_password")).to be_truthy
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
    user.set_email(identity[:uid])

    post "/api/identities/reset_password_mail",
      :headers => json_headers,
      :params => {
        email: identity[:uid]
      }.to_json

    patch "/api/identities/reset_password",
      :headers => json_headers,
      :params => {
        token: "invalid-token",
        password: "reseted_password"
      }.to_json

    json_data = JSON.parse(response.body)
    expect(json_data["error"]).to eq("token not valid")
    expect(response.status).to eq(401)
  end


  it "resetting password with expired token" do
    identity = create(:identity, :existing_identity, user_id: user[:id])

    patch "/api/identities/reset_password",
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

  it "getting all of the providers in an object" do
    identity = create(:identity, :existing_identity, uid: "another@web.de", user_id: user[:id])
    create(:identity, :existing_identity, user_id: user[:id])
    create(:identity, :developer_provider, user_id: user[:id])

    user.set_email(identity[:uid])

    cookies['JWT-TOKEN'] = Auth.encode({user_id: user[:id]})

    get '/api/identities'

    json_data = JSON.parse(response.body)
    expect(json_data["intern"].count).to eq(2)
    expect(json_data["extern"].count).to eq(1)
    expect(json_data["primary"]).to eq(identity[:uid])
    # expect(json_data["confirmed"]).to eq(true)
  end

  it "deleting identity" do
    identity = create(:identity, :existing_identity, uid: "another@web.de", user_id: user[:id])
    create(:identity, :existing_identity, user_id: user[:id])
    cookies['JWT-TOKEN'] = Auth.encode({user_id: user[:id]})

    expect(Identity.all.count).to eq(2)

    delete '/api/identities/delete_identity',
      :headers => json_headers,
      :params => {
        uid: identity.uid
      }.to_json

    expect(response.status).to eq(200)
    expect(Identity.all.count).to eq(1)
  end

  it "deleting identity with wrong uid" do
    identity = create(:identity, :existing_identity, uid: "another@web.de", user_id: user[:id])
    create(:identity, :existing_identity, user_id: user[:id])
    cookies['JWT-TOKEN'] = Auth.encode({user_id: user[:id]})

    expect(Identity.all.count).to eq(2)

    delete '/api/identities/delete_identity',
      :headers => json_headers,
      :params => {
        uid: "wrong_uid"
      }.to_json

    expect(response.status).to eq(401)
    expect(Identity.all.count).to eq(2)
  end

  it "deleting identity from another user" do
    user2 = create(:user)
    identity = create(:identity, :existing_identity, uid: "another@web.de", user_id: user[:id])
    create(:identity, :existing_identity, user_id: user2[:id])
    cookies['JWT-TOKEN'] = Auth.encode({user_id: user2[:id]})

    expect(Identity.all.count).to eq(2)

    delete '/api/identities/delete_identity',
      :headers => json_headers,
      :params => {
        uid: identity.uid
      }.to_json

    expect(response.status).to eq(401)
    expect(Identity.all.count).to eq(2)
  end

  it "deleting identity while passed uid is primary mail" do
    identity = create(:identity, :existing_identity, uid: "another@web.de", user_id: user[:id])
    create(:identity, :existing_identity, user_id: user[:id])
    cookies['JWT-TOKEN'] = Auth.encode({user_id: user[:id]})
    user.set_email(identity[:uid])

    expect(Identity.all.count).to eq(2)

    delete '/api/identities/delete_identity',
      :headers => json_headers,
      :params => {
        uid: identity.uid
      }.to_json

    expect(response.status).to eq(401)
    expect(Identity.all.count).to eq(2)
  end


  it "deleting identity while only one identity exists" do
    identity = create(:identity, :existing_identity, uid: "another@web.de", user_id: user[:id])
    cookies['JWT-TOKEN'] = Auth.encode({user_id: user[:id]})

    delete '/api/identities/delete_identity',
      :headers => json_headers,
      :params => {
        uid: identity.uid
      }.to_json

    expect(response.status).to eq(401)
    expect(Identity.all.count).to eq(1)
  end

  it "sending verify email again" do
    identity = create(:identity, :identity_provider, user_id: user[:id])

    post "/api/identities/send_verify_email",
      :headers => json_headers,
      :params => {
        email: identity[:uid]
      }.to_json

    expect(response.status).to eq(200)
  end

  it "sending verify email in too short a time" do
    identity = create(:identity, :identity_provider, user_id: user[:id])

    post "/api/identities/send_verify_email",
      :headers => json_headers,
      :params => {
        email: identity[:uid]
      }.to_json

    expect(response.status).to eq(200)

    post "/api/identities/send_verify_email",
      :headers => json_headers,
      :params => {
        email: identity[:uid]
      }.to_json

    expect(response.status).to eq(401)
  end

  it "sending verify email with invalid email" do
    identity = create(:identity, :identity_provider, user_id: user[:id])

    post "/api/identities/send_verify_email",
      :headers => json_headers,
      :params => {
        email: "invalid"
      }.to_json

    expect(response.status).to eq(401)
  end

  it "sending verify email wih an already confirmed email" do
    identity = create(:identity, :existing_identity, user_id: user[:id])

    post "/api/identities/send_verify_email",
      :headers => json_headers,
      :params => {
        email: identity[:uid]
      }.to_json

    expect(response.status).to eq(401)
  end
end