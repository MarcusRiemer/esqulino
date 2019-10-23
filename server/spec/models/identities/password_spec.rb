require 'rails_helper'
require 'bcrypt'

RSpec.describe Identity::Password, type: :model do
  it "can't be persisted without parameters" do
    a = Identity::Password.new
    expect(a.validate).to eq false
  end

  it "can't be persisted with only a user" do
    u = create(:user)
    a = Identity::Password.new(user: u)
    expect(a.validate).to eq false
    expect(a.user).to eq u
  end

  it "empty stored passwords don't ever match" do
    a = Identity::Password.new

    expect(a.password_eql? nil).to be false
    expect(a.password_eql? "").to be false
    expect(a.password_eql? "haha").to be false
    expect(a.password_eql? Hash.new).to be false
    expect(a.password_eql? []).to be false
    expect(a.password_eql? ["1"]).to be false
    expect(a.password_eql? 1).to be false
  end

  it "given empty or invalid passwords don't ever match" do
    a = Identity::Password.new(password: "doof")

    expect(a.password_eql? nil).to be false
    expect(a.password_eql? "").to be false
    expect(a.password_eql? "haha").to be false
    expect(a.password_eql? Hash.new).to be false
    expect(a.password_eql? []).to be false
    expect(a.password_eql? ["1"]).to be false
    expect(a.password_eql? 1).to be false
  end

  it "can't be persisted with only a password" do
    a = Identity::Password.new(password: "hahasicher")
    expect(a.validate).to eq false
    expect(a.password_eql? "hahasicher").to eq true
  end


  it "can't be persisted with only a user and a valid password" do
    u = create(:user)
    a = Identity::Password.new(user: u, password: "hahasicher")

    aggregate_failures "validation" do
      expect(a.validate).to eq false
      expect(a.password_eql? "hahasicher").to eq true
      expect(a.user).to eq u
    end
  end

  it "can be persisted with required attributes and a valid hashed password" do
    u = create(:user)
    a = Identity::Password.new(user: u, uid: "a@b.de", password: BCrypt::Password.create("hahasicher"))

    aggregate_failures "validation" do
      expect(a.valid?).to eq true
      expect(a.password_eql? "hahasicher").to eq true
      expect(a.user).to eq u
    end

    expect(a.save).to eq true
    expect(a.persisted?).to eq true
    expect(Identity::Password.first).to eq a
  end

  it "can be persisted with required attributes and a valid plaintext password" do
    u = create(:user)
    a = Identity::Password.new(user: u, uid: "a@b.de", password: "hahasicher")

    aggregate_failures "validation" do
      expect(a.valid?).to eq true
      expect(a.password_eql? "hahasicher").to eq true
      expect(a.user).to eq u
    end
  end


  it "can be persisted with a user and a valid password via data" do
    u = create(:user)
    a = Identity::Password.new(user: u, uid: "a@b.de", own_data: { password: "hahasicher" })

    expect(a.validate).to eq true
    expect(a.password_eql? "hahasicher").to eq true
    expect(a.user).to eq u
  end
end