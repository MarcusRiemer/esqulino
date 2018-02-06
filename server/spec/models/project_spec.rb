require 'rails_helper'

RSpec.describe Project do
  context "to_full_api_response" do
    it "without resources" do
      api_response = FactoryBot.create(:project, name: "Test").to_full_api_response

      expect(api_response).to validate_against "ProjectDescription"
    end
  end
end
