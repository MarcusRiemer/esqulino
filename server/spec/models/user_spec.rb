require 'rails_helper'

RSpec.describe User, type: :model do
  let(:user) { create(:user, display_name: "Tom") }

  it 'creating a user' do
    expect(user.display_name).to eq('Tom')
  end

  describe 'promoting guests to admin' do
    before { create(:user, id: User.guest_id) }

    it 'in development' do
      expect(User.guest.has_role?(:admin)).to eq false
      allow(Rails).to receive(:env).and_return(ActiveSupport::StringInquirer.new("development"))

      User.make_guest_admin!

      expect(User.guest.has_role?(:admin)).to eq true
    end

    it 'in production' do
      expect(User.guest.has_role?(:admin)).to eq false
      allow(Rails).to receive(:env).and_return(ActiveSupport::StringInquirer.new("production"))

      expect{ User.make_guest_admin! }.to raise_exception(EsqulinoError)
      expect(User.guest.has_role?(:admin)).to eq false
    end
  end
end
