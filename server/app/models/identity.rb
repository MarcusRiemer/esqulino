
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
              :changes => {
                primary: self.change_primary_token_exp
              }
            })
  end

  def change_primary_email_token
    return self.own_data["change_primary_email_token"]
  end

  def change_primary_token_exp
    return self.own_data["change_primary_token_exp"]
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
  def self.create_with_auth(auth, user)
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
      raise RuntimeError.new('Unknown provider')
    end

    # checks if someone has already registered this email
    if ((identity.email && User.has_email?(identity.email) && (not user.email.eql?(identity.email)))) then
      raise EsqulinoError.new("E-mail already taken")
    end

    # If the user has no primary e-mail
    if ((not user.email) and identity.confirmed?) then
      user.email = identity.email
    end

    if (user.invalid?) then
      raise EsqulinoError.new(user.errors.full_messages[0])
    end

    if (identity.invalid?) then
      raise EsqulinoError.new(identity.errors.full_messages[0])
    end

    identity.save!
    user.save!

    if (not user.has_role?(:user)) then
      user.add_role :user
    end
  
    return identity
  end
end
