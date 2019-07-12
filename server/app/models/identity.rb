
require 'bcrypt'

class Identity < ActiveRecord::Base
  include BCrypt
  include LocaleHelper

  validates :uid, presence: true
  validates :provider, presence: true

  belongs_to :user

  scope :developer, -> { where(type: 'Developer') }
  scope :google, -> { where(type: 'Google') }
  scope :password, -> { where(type: 'PasswordIdentity') }
  scope :github, -> { where(type: 'Github') }

  def self.find_by_email(email)
    where("provider_data ->> 'email' = ?", email)
  end

  def self.find_by_change_primary_email_token(token)
    where("own_data ->> 'change_primary_email_token' = ?", token)
  end

  def self.search(auth)
    find_by_provider_and_uid(auth[:provider], auth[:uid])
  end

  def to_list_api_response
    return ({
              :id => self.id,
              :type => self.type,
              :email => self.email,
              :confirmed => self.confirmed?,
            })
  end

  def change_primary_email_token
    return self.own_data["change_primary_email_token"]
  end

  def set_primary_email_token
    self.own_data["change_primary_email_token"] = SecureRandom.uuid
    self.own_data["change_primary_token_exp"] = 30.minutes.from_now
  end

  def set_primary_email_token_expired()
    self.own_data["change_primary_token_exp"] = Time.now - 1.hour
  end

  def primary_email_token_eql?(token)
    return self.own_data["change_primary_email_token"].eql? token
  end


  def primary_email_token_expired?()
    return self.own_data["change_primary_token_exp"] < Time.now
  end
end
