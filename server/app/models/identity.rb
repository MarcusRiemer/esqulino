
# Represents a sign in option 
class Identity < ActiveRecord::Base
  include BCrypt

  attr_accessor :credentials

  # The uid is a unique identifier of an identity that has to be set
  validates :uid, presence: true
  validates :provider, presence: true

  belongs_to :user

  # Scopes to search identities of specific providers
  scope :developer, -> { where(type: 'Developer') }
  scope :google, -> { where(type: 'Google') }
  scope :password, -> { where(type: 'PasswordIdentity') }
  scope :github, -> { where(type: 'Github') }

  # Search for all identities with the given email
  def self.find_by_email(email)
    where("provider_data ->> 'email' = ?", email)
  end

   # Search for all identities with the given primary email token
  def self.find_by_change_primary_email_token(token)
    where("own_data ->> 'change_primary_email_token' = ?", token)
  end

  # Search for an identity with the given auth hash.
  def self.search(auth)
    find_by_provider_and_uid(auth[:provider], auth[:uid])
  end

  # Returns a hash containing information about all available providers
  # The available providers are loaded from the sqlino file
  def self.all_client_information
    to_return = Rails.configuration.sqlino["auth_provider"].map do |k|
      infos = k.constantize.client_information
      infos = infos ? infos.slice(:name, :url_name, :icon, :color) : infos
    end
    return to_return.filter { |v| v }
  end

  # Creates an identity with omniauth callback or create_identity_data,
  # create_identity_data takes the posted values and put them into a hash
  def self.create_with_auth(auth, user)
    if (user.eql? User.guest) then
      user = User.create_from_hash(auth)
    end

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
    if ((identity.email && User.has_someone_email?(identity.email) && (not user.email.eql?(identity.email)))) then
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

  # Creates a hash that is passed to the client
  # contains all information about a current selected identity 
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

  # Comes from Omniauth and contains an acces/refresh token from oauth2
  def credentials
    return self.provider_data["credentials"]
  end

  def credentials=(credentials)
    self.provider_data["credentials"] = credentials
  end

  def acces_token_expires?
    return self.credentials["expires"]
  end

  # Will be created on a primary e-mail change
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
end
