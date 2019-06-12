
require 'bcrypt'

class Identity < ApplicationRecord
  include BCrypt

  belongs_to :user

  attr_accessor :email, :name, :password, :password_confirmation

  scope :search_with_user_id, -> (user_id) {
    where("user_id = ?", user_id)
  }

  def self.search(auth)
    find_by_provider_and_uid(auth[:provider], auth[:uid])
  end

  def self.create_with_auth(auth, user)
    user ||= User.create_from_hash(auth)
    Identity.create(:user => user, :uid => auth[:uid], :provider => auth[:provider], :data => auth[:data])
  end

  def confirmed!()
    self.data["confirmed"] = true;
    self.save!
  end

  def delete_identity!()
    self.delete(self.id)
  end

  def set_password(password)
    self.data["password"] = Password.create(password)
    self.save
  end

  def set_reset_token_expired()
    self.data["password_reset_token_exp"] = Time.now - 1.hour
    self.save
  end

  def set_reset_token()
    self.data["password_reset_token"] = SecureRandom.uuid
    self.data["password_reset_token_exp"] = 30.minutes.from_now
    self.save
  end

  def reset_token_eql?(token)
    return self.data["password_reset_token"].eql? token
  end

  def reset_token_expired?()
    return self.data["password_reset_token_exp"] < Time.now
  end

  def password_eql?(password)
    return Password.new(self.data["password"]) == password
  end

  def confirmed?()
    return self.data["confirmed"]
  end

  private 

  def sign_up
    password = Password.new(self.data["password"])
    unless password.length < 3
      puts "Error"      
    end
  end
end

