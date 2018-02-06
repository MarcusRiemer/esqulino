require 'rails_helper'

RSpec.describe ProjectSource do
  it "to_full_api_response" do
    api_response = FactoryBot.create(:project_source).to_full_api_response

    expect(api_response).to validate_against "ProjectSourceDescription"
  end
end
