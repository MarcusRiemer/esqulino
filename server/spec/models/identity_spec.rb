require 'rails_helper'

RSpec.describe Identity::Identity, type: :model do
  it 'creating identitys without uid' do
    google_ident = Identity::Google.new(uid: nil)
    developer_ident = Identity::Developer.new(uid: nil)

    aggregate_failures "validations" do
      expect(google_ident.invalid?).to eq(true)
      expect(developer_ident.invalid?).to eq(true)
    end
  end

  it 'creating identitys without provider' do
    google_ident = Identity::Google.new(provider: nil)
    developer_ident = Identity::Developer.new(provider: nil)

    aggregate_failures "validations" do
      expect(google_ident.invalid?).to eq(true)
      expect(developer_ident.invalid?).to eq(true)
    end
  end
end
