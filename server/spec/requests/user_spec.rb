
require 'rails_helper'

RSpec.describe "user controller" do
  json_headers = { "CONTENT_TYPE" => "application/json" }

  it 'getting the user description logged in' do
    user = create(:user)
    cookies['JWT-TOKEN'] = Auth.encode({user_id: user[:id], data: {"confirmed": true}})

    get '/api/user'

    json_data = JSON.parse(response.body)
    expect(json_data["loggedIn"]).to eq(true)  
  end

  it 'getting the user description logged out' do
    get '/api/user'

    json_data = JSON.parse(response.body)
    expect(json_data["loggedIn"]).to eq(false)  
  end

  it 'changing primary email logged out' do
    patch '/api/user/change_primary_email',
      :headers => json_headers,
      :params => {
        primaryEmail: "test@web.de"
      }.to_json

    expect(response.status).to eq(401)
  end

  it 'changing primary email logged in' do
    identity = create(:identity_provider, :existing)
    identity2 = create(:identity_provider, :existing, uid: "another@web.de", user_id: identity.user_id)
    identity.user.set_email(identity.uid)

    cookies['JWT-TOKEN'] = Auth.encode({user_id: identity.user_id, data: {"confirmed": true}})
    expect(User.first.email).to eq(identity.uid)

    patch '/api/user/change_primary_email',
      :headers => json_headers,
      :params => {
        primaryEmail: identity2.uid
      }.to_json

    expect(response.status).to eq(200)
    expect(User.first.email).to eq(identity2.uid)
  end

  it 'changing primary email to an unconfirmed email' do
    identity = create(:identity_provider, :existing)
    identity2 = create(:identity_provider, :new, uid: "another@web.de", user_id: identity.user_id)
    identity.user.set_email(identity.uid)

    cookies['JWT-TOKEN'] = Auth.encode({user_id: identity.user_id, data: {"confirmed": true}})
    expect(User.first.email).to eq(identity.uid)

    patch '/api/user/change_primary_email',
      :headers => json_headers,
      :params => {
        primaryEmail: identity2.uid
      }.to_json

    expect(response.status).to eq(401)
    expect(User.first.email).to eq(identity.uid)
  end

  it 'changing primary email to an not existing email' do
    identity = create(:identity_provider, :existing)
    identity2 = create(:identity_provider, :new, uid: "another@web.de", user_id: identity.user_id)
    identity.user.set_email(identity.uid)

    cookies['JWT-TOKEN'] = Auth.encode({user_id: identity.user_id, data: {"confirmed": true}})
    expect(User.find_by(id: identity.user_id)[:email]).to eq(identity.uid)

    patch '/api/user/change_primary_email',
      :headers => json_headers,
      :params => {
        primaryEmail: "not_existing@web.de"
      }.to_json

    expect(response.status).to eq(401)
    expect(User.find_by(id: identity.user_id)[:email]).to eq(identity.uid)
  end

  it 'changing primary email to an already linked email' do
    identity = create(:identity_provider, :existing)
    identity2 = create(:identity_provider, :existing, uid: "another@web.de")
    identity.user.set_email(identity.uid)

    cookies['JWT-TOKEN'] = Auth.encode({user_id: identity.user_id, data: {"confirmed": true}})
    expect(User.find_by(id: identity.user_id)[:email]).to eq(identity.uid)

    patch '/api/user/change_primary_email',
      :headers => json_headers,
      :params => {
        primaryEmail: identity2.uid
      }.to_json

    expect(response.status).to eq(401)
    expect(User.find_by(id: identity.user_id)[:email]).to eq(identity.uid)
  end

  it "changing username with an valid" do
    identity = create(:identity_provider, :existing)
    cookies['JWT-TOKEN'] = Auth.encode({user_id: identity.user_id, data: {"confirmed": true}})

    expect(User.find_by(id: identity.user_id)[:display_name]).to eq("Blattwerkzeug")

    patch '/api/user/change_username',
      :headers => json_headers,
      :params => {
        displayName: "New name"
      }.to_json

    expect(User.find_by(id: identity.user_id)[:display_name]).to eq("New name")
  end

  it "changing username with an invalid (empty string)" do
    identity = create(:identity_provider, :existing)
    cookies['JWT-TOKEN'] = Auth.encode({user_id: identity.user_id, data: {"confirmed": true}})

    expect(User.find_by(id: identity.user_id)[:display_name]).to eq("Blattwerkzeug")

    patch '/api/user/change_username',
      :headers => json_headers,
      :params => {
        displayName: ""
      }.to_json

    expect(User.find_by(id: identity.user_id)[:display_name]).to eq("Blattwerkzeug")
  end
end