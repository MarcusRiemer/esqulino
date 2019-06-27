require 'rails_helper'

RSpec.describe User, type: :model do
  let(:user) { create(:user, display_name: "Tom") }

  it 'creating a user' do 
    expect(user.display_name).to eq('Tom')
  end

  # it 'creating new user and intern identity' do
  #   identity = create(:identity, :identity_provider, user_id: user[:id])

  #   expect(user[:email]).to eq(identity[:uid])
  # end
end
