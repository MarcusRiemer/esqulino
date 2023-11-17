require 'rails_helper'

RSpec.describe CurrentUserHelper, type: :helper do
  # The helper expects to find the guest user
  before(:each) { create(:user, :guest) }

  it 'returns the guest user for missing tokens' do
    result_user = validate_user_from_tokens(
      browser_access_token: nil,
      browser_refresh_token: nil
    )
    expect(result_user).to eq(User.guest)
  end
end
