require 'rails_helper'

RSpec.describe User, type: :model do
  it 'creating a user' do
    user = create(:user, display_name: "Tom")

    expect(user.display_name).to eq('Tom')
    expect(user.readable_identification).to include('Tom')
    expect(user.readable_identification).to include(user.id)
  end

  it 'guest behaves as a guest' do
    create(:user, :guest)

    expect(User.guest.guest?).to eq true
    expect(User.guest.role_names).to eq ['guest']
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

      expect { User.make_guest_admin! }.to raise_exception(EsqulinoError::Base)
      expect(User.guest.has_role?(:admin)).to eq false
    end
  end

  describe 'promoting any user to admin' do
    before { create(:user, id: User.guest_id) }

    it 'normal user in development' do
      user = create(:user)
      expect(user.has_role?(:admin)).to eq false

      allow(Rails).to receive(:env).and_return(ActiveSupport::StringInquirer.new("development"))
      User.make_user_admin! user.id

      expect(user.has_role?(:admin)).to eq true
    end

    it 'normal user in production' do
      user = create(:user)
      expect(user.has_role?(:admin)).to eq false

      allow(Rails).to receive(:env).and_return(ActiveSupport::StringInquirer.new("production"))
      User.make_user_admin! user.id

      expect(user.has_role?(:admin)).to eq true
    end

    it 'guest user in development' do
      expect(User.guest.has_role?(:admin)).to eq false

      allow(Rails).to receive(:env).and_return(ActiveSupport::StringInquirer.new("development"))
      User.make_user_admin! User.guest.id

      expect(User.guest.has_role?(:admin)).to eq true
    end

    it 'guest user in production' do
      expect(User.guest.has_role?(:admin)).to eq false

      allow(Rails).to receive(:env).and_return(ActiveSupport::StringInquirer.new("production"))
      expect { User.make_user_admin! User.guest.id }.to raise_exception(EsqulinoError::Base)

      expect(User.guest.has_role?(:admin)).to eq false
    end
  end
end
