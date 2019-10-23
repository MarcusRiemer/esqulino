require 'rails_helper'

RSpec.describe Identity::Identity, type: :model do
  it 'creating identitys without uid' do
    pw_ident = Identity::Password.new(uid: nil)
    google_ident = Identity::Google.new(uid: nil)
    github_ident = Identity::Github.new(uid: nil)
    developer_ident = Identity::Developer.new(uid: nil)

    aggregate_failures "validations" do
      expect(pw_ident.invalid?).to eq(true)
      expect(google_ident.invalid?).to eq(true)
      expect(github_ident.invalid?).to eq(true)
      expect(developer_ident.invalid?).to eq(true)
    end
  end

  it 'creating identitys without provider' do
    pw_ident = Identity::Password.new(provider: nil)
    google_ident = Identity::Google.new(provider: nil)
    github_ident = Identity::Github.new(provider: nil)
    developer_ident = Identity::Developer.new(provider: nil)

    aggregate_failures "validations" do
      expect(pw_ident.invalid?).to eq(true)
      expect(google_ident.invalid?).to eq(true)
      expect(github_ident.invalid?).to eq(true)
      expect(developer_ident.invalid?).to eq(true)
    end
  end

  it 'testing primary_email_token functions' do
    pw_ident = create(:identity_provider, :existing)
    google_ident = create(:google_provider, :existing)
    github_ident = create(:github_provider, :existing)
    developer_ident = create(:developer_provider, :existing)
    identities = Identity::Identity.all.map do |k|
      k.set_primary_email_token
      k.save!
    end

    aggregate_failures "is primary_email_token set and not expired?" do
      expect(Identity::Password.first.primary_email_token_expired?).to eq(false)
      expect(Identity::Google.first.primary_email_token_expired?).to eq(false)
      expect(Identity::Github.first.primary_email_token_expired?).to eq(false)
      expect(Identity::Developer.first.primary_email_token_expired?).to eq(false)
    end

    identities = Identity::Identity.all.map do |k|
      k.set_primary_email_token_expired
      k.save!
    end

    aggregate_failures "is primary_email_token expired?" do
      expect(Identity::Password.first.primary_email_token_expired?).to eq(true)
      expect(Identity::Google.first.primary_email_token_expired?).to eq(true)
      expect(Identity::Github.first.primary_email_token_expired?).to eq(true)
      expect(Identity::Developer.first.primary_email_token_expired?).to eq(true)
    end
  end
end
