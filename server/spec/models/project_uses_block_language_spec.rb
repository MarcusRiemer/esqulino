require 'rails_helper'

RSpec.describe ProjectUsesBlockLanguage, type: :model do
  it '#key_search_attributes' do
    used = ProjectUsesBlockLanguage.new(block_language_id: SecureRandom.uuid,
                                        project_id: SecureRandom.uuid)

    expect(used.key_search_attributes).to eq({
                                               "block_language_id" => used.block_language_id,
                                               "project_id" => used.project_id
                                             })
  end

  it '#to_api_response' do
    used = ProjectUsesBlockLanguage.new(block_language_id: SecureRandom.uuid,
                                        project_id: SecureRandom.uuid)

    expect(used.to_api_response).to validate_against "ProjectUsesBlockLanguageDescription"
  end
end
