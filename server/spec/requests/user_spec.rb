
require 'rails_helper'

RSpec.fdescribe "user controller" do
  json_headers = { "CONTENT_TYPE" => "application/json" }

  let(:user) { create(:user) }

  it 'getting the user description logged in' do
    cookies['JWT-TOKEN'] = Auth.encode({user_id: user[:id]})

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
    put '/api/user/change_primary_email',
      :headers => json_headers,
      :params => {
        primaryEmail: "test@web.de"
      }.to_json

    expect(response.status).to eq(401)
  end

  it 'changing primary email logged in' do
    identity = create(:identity, :existing_identity, user_id: user[:id])
    identity2 = create(:identity, :existing_identity, uid: "another@web.de", user_id: user[:id])
    user.set_email(identity.uid)

    cookies['JWT-TOKEN'] = Auth.encode({user_id: user[:id]})
    expect(User.first.email).to eq(identity.uid)

    put '/api/user/change_primary_email',
      :headers => json_headers,
      :params => {
        primaryEmail: identity2.uid
      }.to_json

    expect(response.status).to eq(200)
    expect(User.first.email).to eq(identity2.uid)
  end

  it 'changing primary email to an unconfirmed email' do
    identity = create(:identity, :existing_identity, user_id: user[:id])
    identity2 = create(:identity, :identity_provider, uid: "another@web.de", user_id: user[:id])
    user.set_email(identity.uid)

    cookies['JWT-TOKEN'] = Auth.encode({user_id: user[:id]})
    expect(User.first.email).to eq(identity.uid)

    put '/api/user/change_primary_email',
      :headers => json_headers,
      :params => {
        primaryEmail: identity2.uid
      }.to_json

    expect(response.status).to eq(401)
    expect(User.first.email).to eq(identity.uid)
  end

  it 'changing primary email to an not existing email' do
    identity = create(:identity, :existing_identity, user_id: user[:id])
    identity2 = create(:identity, :identity_provider, uid: "another@web.de", user_id: user[:id])
    user.set_email(identity.uid)

    cookies['JWT-TOKEN'] = Auth.encode({user_id: user[:id]})
    expect(User.find_by(id: identity[:user_id])[:email]).to eq(identity.uid)

    put '/api/user/change_primary_email',
      :headers => json_headers,
      :params => {
        primaryEmail: "not_existing@web.de"
      }.to_json

    expect(response.status).to eq(401)
    expect(User.find_by(id: identity[:user_id])[:email]).to eq(identity.uid)
  end

  it 'changing primary email to an already linked email' do#
    user2 = create(:user)
    identity = create(:identity, :existing_identity, user_id: user[:id])
    identity2 = create(:identity, :existing_identity, uid: "another@web.de", user_id: user2[:id])
    user.set_email(identity.uid)

    cookies['JWT-TOKEN'] = Auth.encode({user_id: user[:id]})
    expect(User.find_by(id: identity[:user_id])[:email]).to eq(identity.uid)

    put '/api/user/change_primary_email',
      :headers => json_headers,
      :params => {
        primaryEmail: identity2.uid
      }.to_json

    expect(response.status).to eq(401)
    expect(User.find_by(id: identity[:user_id])[:email]).to eq(identity.uid)
  end
end