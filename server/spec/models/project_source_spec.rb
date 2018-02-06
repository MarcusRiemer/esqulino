require 'rails_helper'

RSpec.describe ProjectSource do
  it "to_full_api_response" do
    api_response = FactoryBot.build(:project_source).to_full_api_response

    expect(api_response['title']).to be_a String
    expect(api_response['display']).to be_a String
    expect(api_response.key? 'createdAt').to be true
    expect(api_response.key? 'updatedAt').to be true
  end
end
