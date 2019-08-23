
require 'rails_helper'

RSpec.describe "identities controller" do
  json_headers = { "CONTENT_TYPE" => "application/json" }

  before(:each) { create(:user, :guest) }

  it "saving password as hash" do
    identity = create(:identity_provider, :new, password: "1234567")
    expect(identity.password).to_not eq("1234567")
    expect(PasswordIdentity.all.first.password_eql?("1234567")).to be_truthy
  end

  describe "listing response" do
    it "own identities" do
      identity = create(:identity_provider, :existing)

      create(:developer_provider, :new, user: identity.user)
      create(:google_provider, :existing, user: identity.user)

      identity.user.email = identity.uid
      identity.user.save!

      set_jwt(identity.user)

      get "/api/identities"
      json_response = JSON.parse(response.body)
      provider_list = json_response["providers"].map { |k| k["type"] }

      aggregate_failures "response validation" do
        expect(json_response).to validate_against "ServerProviderDescription"
        expect(json_response["primary"]).to eq(identity.user.email)
        expect(provider_list.include? "PasswordIdentity").to be_truthy
        expect(provider_list.include? "Google").to be_truthy
        expect(provider_list.include? "Developer").to be_truthy
      end
    end

    it "all providers" do
      get "/api/identities/list"
      json_response = JSON.parse(response.body)

      expect(json_response.length).to eq(4)
    end
  end

  describe "e-mail confirmation" do
    let!(:identity) { create(:identity_provider, :new) }

    it "valid" do
      expect(identity.confirmed?).to eq(false)

      get "/api/identities/confirmation/#{identity.verify_token}"

      expect(Identity.find(identity.id).confirmed?).to eq(true)
    end

    it "e-mail confirmation with wrong token" do
      confirmed = identity.confirmed?

      expect(confirmed).to eq(false)

      get "/api/identities/confirmation/123121212"

      expect(Identity.find(identity.id).confirmed?).to eq(false)
    end
  end

  describe "password changing" do
    let!(:identity) { create(:identity_provider, :existing) }

    context "valid" do
      it "single identity" do
        set_jwt(identity.user)

        patch '/api/identities/change_password',
          :headers => json_headers,
          :params => {
            currentPassword: identity.password,
            newPassword: "newPassword"
          }.to_json

        expect(PasswordIdentity.all.first.password_eql?("newPassword"))
      end

      it "all identities with password" do
        create(:identity_provider, :new)
        set_jwt(identity.user)

        patch '/api/identities/change_password',
          :headers => json_headers,
          :params => {
            currentPassword: identity.password,
            newPassword: "newPassword"
          }.to_json

        expect(Identity.all.count).to eq(2)
        expect(PasswordIdentity.all.first.password_eql?("newPassword"))
        expect(PasswordIdentity.all.last.password_eql?("newPassword"))
      end
    end

    it "invalid current password" do
      set_jwt(identity.user)

      patch '/api/identities/change_password',
        :headers => json_headers,
        :params => {
          currentPassword: "12121212",
          newPassword: "newPassword"
        }.to_json

      expect(PasswordIdentity.all.first.password).to eq(identity.password)
    end
  end

  describe "resetting password" do
    let!(:identity) { create(:identity_provider, :existing) }
    it "valid" do
      identity.user.email = identity[:uid]
      identity.user.save!

      post "/api/identities/reset_password_mail",
        :headers => json_headers,
        :params => {
          email: identity.user[:email]
        }.to_json

      patch "/api/identities/reset_password",
        :headers => json_headers,
        :params => {
          token: PasswordIdentity.first.password_reset_token,
          password: "reseted_password"
        }.to_json

      expect(PasswordIdentity.all.first.password_eql?("reseted_password")).to be_truthy
    end

    context "invalid" do
      it "wrong email" do
        post "/api/identities/reset_password_mail",
          :headers => json_headers,
          :params => {
            email: "wrong@email.de"
          }.to_json

        json_data = JSON.parse(response.body)
        expect(json_data["message"]).to eq("e-mail not found")
        expect(response.status).to eq(401)
      end

      it "invalid token" do
        identity.user.email = identity[:uid]
        identity.user.save!

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
        expect(json_data["message"]).to eq("token not valid")
        expect(response.status).to eq(401)
      end

      it "expired token" do
        patch "/api/identities/reset_password",
          :headers => json_headers,
          :params => {
            email: identity[:uid],
            token: identity.password_reset_token,
            password: "reseted_password"
          }.to_json

        json_data = JSON.parse(response.body)
        expect(json_data["message"]).to eq("token expired")
        expect(response.status).to eq(401)
      end
    end
  end

  describe "deleting identity" do
    let!(:identity) { create(:identity_provider, :existing, uid: "another@web.de") }

    it "valid" do
      create(:identity_provider, :existing, user_id: identity.user_id)
      set_jwt(identity.user)

      expect(Identity.all.count).to eq(2)

      delete '/api/identities/delete_identity',
        :headers => json_headers,
        :params => {
          id: identity.id
        }.to_json

      expect(response.status).to eq(200)
      expect(Identity.all.count).to eq(1)
    end

    context "invalid" do
      it "wrong uid" do
        create(:identity_provider, :existing)
        set_jwt(identity.user)

        expect(Identity.all.count).to eq(2)

        delete '/api/identities/delete_identity',
          :headers => json_headers,
          :params => {
            id: "wrong_uid"
          }.to_json

        expect(response.status).to eq(401)
        expect(Identity.all.count).to eq(2)
      end

      it "from another user" do
        identity2 = create(:identity_provider, :existing)
        set_jwt(identity2.user)

        expect(Identity.all.count).to eq(2)

        delete '/api/identities/delete_identity',
          :headers => json_headers,
          :params => {
            id: identity.id
          }.to_json

        expect(response.status).to eq(401)
        expect(Identity.all.count).to eq(2)
      end

      it "passed uid is primary mail" do
        create(:identity_provider, :existing)

        set_jwt(identity.user)
        identity.user.email = identity[:uid]
        identity.user.save!

        expect(Identity.all.count).to eq(2)

        delete '/api/identities/delete_identity',
          :headers => json_headers,
          :params => {
            id: identity.id
          }.to_json

        expect(response.status).to eq(401)
        expect(Identity.all.count).to eq(2)
      end

      it "only one existing identity" do
        set_jwt(identity.user)

        delete '/api/identities/delete_identity',
          :headers => json_headers,
          :params => {
            id: identity.id
          }.to_json

        expect(response.status).to eq(401)
        expect(Identity.all.count).to eq(1)
      end
    end
  end

  describe "sending verify mail again" do
    let(:identity) { create(:identity_provider, :new) }

    it "valid" do
      post "/api/identities/send_verify_email",
        :headers => json_headers,
        :params => {
          email: identity[:uid]
        }.to_json

      expect(response.status).to eq(200)
    end

    context "invalid" do
      it "in too short a time" do
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

      it "invalid email" do
        post "/api/identities/send_verify_email",
          :headers => json_headers,
          :params => {
            email: "invalid"
          }.to_json

        expect(response.status).to eq(401)
      end

      it "already confirmed email" do
        identity.confirmed!
        identity.save!

        post "/api/identities/send_verify_email",
          :headers => json_headers,
          :params => {
            email: identity[:uid]
          }.to_json

        expect(response.status).to eq(401)
      end
    end
  end
end