require 'rails_helper'

RSpec.describe Identity, type: :model do
  it 'creating identitys without uid' do
    pw_ident = PasswordIdentity.new(uid: nil)
    google_ident = Google.new(uid: nil)
    github_ident = Github.new(uid: nil)
    developer_ident = Developer.new(uid: nil)
  
    aggregate_failures "validations" do
      expect(pw_ident.invalid?).to eq(true)
      expect(google_ident.invalid?).to eq(true)
      expect(github_ident.invalid?).to eq(true)
      expect(developer_ident.invalid?).to eq(true)
    end
  end

  it 'creating identitys without provider' do
    pw_ident = PasswordIdentity.new(provider: nil)
    google_ident = Google.new(provider: nil)
    github_ident = Github.new(provider: nil)
    developer_ident = Developer.new(provider: nil)
  
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
    identities = Identity.all.map do |k|
      k.set_primary_email_token
      k.save!
    end

    aggregate_failures "is primary_email_token set and not expired?" do
      expect(PasswordIdentity.first.primary_email_token_expired?).to eq(false)
      expect(Google.first.primary_email_token_expired?).to eq(false)
      expect(Github.first.primary_email_token_expired?).to eq(false)
      expect(Developer.first.primary_email_token_expired?).to eq(false)
    end

    identities = Identity.all.map do |k| 

      k.set_primary_email_token_expired
      k.save!
    end

    aggregate_failures "is primary_email_token expired?" do
      expect(PasswordIdentity.first.primary_email_token_expired?).to eq(true)
      expect(Google.first.primary_email_token_expired?).to eq(true)
      expect(Github.first.primary_email_token_expired?).to eq(true)
      expect(Developer.first.primary_email_token_expired?).to eq(true)
    end
  end
end
