require 'rails_helper'

RSpec.describe Project do
  context "to_full_api_response" do
    it "without resources" do
      api_response = FactoryBot.build(:project, name: "Test").to_full_api_response

      expect(api_response['name']).to eq "Test"
      expect(api_response['sources']).to be_a Array
      expect(api_response['codeResources']).to be_a Array
      expect(api_response.key? 'createdAt').to be true
      expect(api_response.key? 'updatedAt').to be true
    end
  end
end
