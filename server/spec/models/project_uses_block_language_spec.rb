require 'rails_helper'

RSpec.describe ProjectUsesBlockLanguage, type: :model do
  it '#to_api_response' do
    used = ProjectUsesBlockLanguage.new(id: SecureRandom.uuid,
                                        block_language_id: SecureRandom.uuid,
                                        project_id: SecureRandom.uuid)

    expect(used.to_api_response).to validate_against "ProjectUsesBlockLanguageDescription"
  end
end
