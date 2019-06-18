
require 'bcrypt'

class Identity < ActiveRecord::Base;
  include BCrypt

  belongs_to :user
  attr_accessor :email, :name, :password, :password_confirmation

  scope :extern_provider, -> (user_id) {
    where("user_id = ? and provider != 'identity'", user_id)
  }

  scope :intern_provider, -> (user_id) {
    where("user_id = ? and provider = 'identity'", user_id)
  }


  def self.search(auth)
    find_by_provider_and_uid(auth[:provider], auth[:uid])
  end

  def self.create_with_auth(auth, user)
    user ||= User.create_from_hash(auth)

    # If there exists a user with an extern provider and an
    # intern provider will be registered. Set primary e-mail
    if !user.email? && (auth[:provider].eql? "identity")
      user.set_email(auth[:uid])
    end

    Identity.create(:user => user, :uid => auth[:uid], :provider => auth[:provider], :data => auth[:data])
  end

  private 

  def sign_up
    password = Password.new(self.data["password"])
    unless password.length < 3
      puts "Error"      
    end
  end
end

