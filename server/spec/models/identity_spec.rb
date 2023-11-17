# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Identity::Identity, type: :model do
  it 'creating identitys without uid' do
    developer_ident = Identity::Developer.new(uid: nil)
    keycloak_ident = Identity::Keycloak.new(uid: nil)

    aggregate_failures 'validations' do
      expect(developer_ident.invalid?).to eq(true)
      expect(keycloak_ident.invalid?).to eq(true)
    end
  end

  it 'creating identitys without provider' do
    developer_ident = Identity::Developer.new(provider: nil)
    keycloak_ident = Identity::Developer.new(provider: nil)

    aggregate_failures 'validations' do
      expect(developer_ident.invalid?).to eq(true)
      expect(keycloak_ident.invalid?).to eq(true)
    end
  end
end
