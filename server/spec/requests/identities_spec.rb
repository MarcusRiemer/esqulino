
require 'rails_helper'

RSpec.fdescribe "identities controller" do
  json_headers = { "CONTENT_TYPE" => "application/json" }

  it "e-mail confirmation" do
    identity = create(:identity, :new_identity_provider)
    confirmed = identity[:data]["confirmed"]

    expect(confirmed).to eq(false)  

    get "/api/identities/confirmation/#{identity[:data]["verify_token"]}"

    expect(Identity.all.first[:data]["confirmed"]).to eq(true)  
  end

  it "e-mail confirmation with wrong token" do
    identity = create(:identity, :new_identity_provider)
    confirmed = identity[:data]["confirmed"]

    expect(confirmed).to eq(false)  

    get "/api/identities/confirmation/123121212"

    expect(Identity.all.first[:data]["confirmed"]).to eq(false)
  end

  it "saving password as hash" do
    identity = create(:identity, :new_identity_provider, password: "1234567")
    expect(identity[:data]["password"]).to_not eq("1234567")
    expect(PasswordIdentity.all.first.password_eql?("1234567")).to be_truthy
  end

  it "password changing" do
    identity = create(:identity, :existing_identity_provider)

    cookies['JWT-TOKEN'] = Auth.encode({user_id: identity.user_id})

    patch '/api/identities/change_password',
      :headers => json_headers,
      :params => {
        currentPassword: identity[:data]["password"],
        newPassword: "newPassword"
      }.to_json

    expect(PasswordIdentity.all.first.password_eql?("newPassword"))
  end

  it "password changing of all identities with password" do
    create(:identity, :new_identity_provider)
    identity = create(:identity, :existing_identity_provider)

    cookies['JWT-TOKEN'] = Auth.encode({user_id: identity.user_id})

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
    identity = create(:identity, :existing_identity_provider)

    cookies['JWT-TOKEN'] = Auth.encode({user_id: identity.user_id})

    patch '/api/identities/change_password',
      :headers => json_headers,
      :params => {
        currentPassword: "12121212",
        newPassword: "newPassword"
      }.to_json

    expect(PasswordIdentity.all.first[:data]["password"]).to eq(identity[:data]["password"])
  end

  it "resetting password" do
    identity = create(:identity, :existing_identity_provider)
    identity.user.set_email(identity[:uid])

    post "/api/identities/reset_password_mail",
      :headers => json_headers,
      :params => {
        email: identity.user[:email]
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
    identity = create(:identity, :existing_identity_provider)

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
    identity = create(:identity, :existing_identity_provider)
    identity.user.set_email(identity[:uid])

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
    identity = create(:identity, :existing_identity_provider)

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
    identity = create(:identity, :existing_identity_provider, uid: "another@web.de")
    create(:identity, :existing_identity_provider, user_id: identity.user_id)
    create(:identity, :new_developer_provider, user_id: identity.user_id)

    identity.user.set_email(identity[:uid])

    cookies['JWT-TOKEN'] = Auth.encode({user_id: identity.user_id})

    get '/api/identities'

    json_data = JSON.parse(response.body)
    expect(json_data["intern"].count).to eq(2)
    expect(json_data["extern"].count).to eq(1)
    expect(json_data["primary"]).to eq(identity[:uid])
    # expect(json_data["confirmed"]).to eq(true)
  end

  it "deleting identity" do
    identity = create(:identity, :existing_identity_provider, uid: "another@web.de")
    create(:identity, :existing_identity_provider, user_id: identity.user_id)
    cookies['JWT-TOKEN'] = Auth.encode({user_id: identity.user_id})

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
    identity = create(:identity, :existing_identity_provider, uid: "another@web.de")
    create(:identity, :existing_identity_provider)
    cookies['JWT-TOKEN'] = Auth.encode({user_id: identity.user_id})

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
    identity = create(:identity, :existing_identity_provider, uid: "another@web.de")
    identity2 = create(:identity, :existing_identity_provider)
    cookies['JWT-TOKEN'] = Auth.encode({user_id: identity2.user_id})

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
    identity = create(:identity, :existing_identity_provider, uid: "another@web.de")
    create(:identity, :existing_identity_provider)

    cookies['JWT-TOKEN'] = Auth.encode({user_id: identity.user_id})
    identity.user.set_email(identity[:uid])

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
    identity = create(:identity, :existing_identity_provider, uid: "another@web.de")
    cookies['JWT-TOKEN'] = Auth.encode({user_id: identity.user_id})

    delete '/api/identities/delete_identity',
      :headers => json_headers,
      :params => {
        uid: identity.uid
      }.to_json

    expect(response.status).to eq(401)
    expect(Identity.all.count).to eq(1)
  end

  it "sending verify email again" do
    identity = create(:identity, :new_identity_provider)

    post "/api/identities/send_verify_email",
      :headers => json_headers,
      :params => {
        email: identity[:uid]
      }.to_json

    expect(response.status).to eq(200)
  end

  it "sending verify email in too short a time" do
    identity = create(:identity, :new_identity_provider)

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
    identity = create(:identity, :new_identity_provider)

    post "/api/identities/send_verify_email",
      :headers => json_headers,
      :params => {
        email: "invalid"
      }.to_json

    expect(response.status).to eq(401)
  end

  it "sending verify email wih an already confirmed email" do
    identity = create(:identity, :existing_identity_provider)

    post "/api/identities/send_verify_email",
      :headers => json_headers,
      :params => {
        email: identity[:uid]
      }.to_json

    expect(response.status).to eq(401)
  end
end