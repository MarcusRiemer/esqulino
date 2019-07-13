
require 'bcrypt'
class Identity < ActiveRecord::Base
  include BCrypt

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

  def self.all_client_informations
    to_return = Rails.configuration.sqlino["auth_provider"].map do |k|
      infos = k.constantize.client_informations
      infos = infos ? infos.slice(:name, :url_name, :icon, :color) : infos
    end
    return to_return.filter { |v| v }
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

  # Creates an identity with omniauth callback or create_identity_data,
  # create_identity_data takes the posted values and put them into a hash
  def self.create_with_auth(auth, user, email = false)
    case auth[:provider]
    when 'developer'
      identity = Developer.create_with_auth(auth, user)
    when 'identity'
      identity = PasswordIdentity.create_with_auth(auth, user)
    when 'google_oauth2'
      identity = Google.create_with_auth(auth, user)
    when 'github'
      identity = Github.create_with_auth(auth, user)
    else
      raise Exception.new('Unknown provider')
    end

    if (user.invalid?) then
      raise Exception.new("Error: Something went wrong with the creation of a user")
    end

    if (identity.invalid?) then
      raise Exception.new("Error: Something went wrong with the creation of an identity")
    end

    # If the user has no primary e-mail
    if (not user.email) then
      user.email = identity.email
    end

    identity.save!
    user.save!

    if (not user.has_role?(:user)) then
      user.add_role :user
    end
  
    # sends an confirmation e-mail
    if (email) then
      IdentityMailer.confirm_email(identity, request_locale).deliver
    end

    return identity
  end
end
