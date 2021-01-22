require 'rails_helper'

RSpec.describe "identities controller" do
  json_headers = { "CONTENT_TYPE" => "application/json" }

  before(:each) { create(:user, :guest) }

  describe "listing response" do
    it "own identities" do
      # Developer identity
      identity = create(:developer_provider, :existing)

      identity.user.email = identity.uid
      identity.user.save!

      set_access_token(identity.user)

      get "/api/identities"
      json_response = JSON.parse(response.body)
      provider_list = json_response["providers"].map { |k| k["type"] }

      aggregate_failures "response validation" do
        expect(json_response).to validate_against "ServerProviderDescription"
        expect(json_response["primary"]).to eq(identity.user.email)
        expect(provider_list.include? "Identity::Developer").to be_truthy
      end
    end

    it "all providers" do
      get "/api/identities/list"
      json_response = JSON.parse(response.body)

      expect(json_response.length).to eq(1)
      json_response.each do |provider|
        expect(provider).to validate_against "AvailableProviderDescription"
      end
    end
  end
end
