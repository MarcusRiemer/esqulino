module Identity
  # Represents a sign in option
  class Identity < ActiveRecord::Base
    # The uid is a unique identifier of an identity that has to be set
    validates :uid, presence: true
    validates :provider, presence: true

    belongs_to :user

    # Scopes to search identities of specific providers
    scope :developer, -> { where(type: 'Identity::Developer') }
    scope :google, -> { where(type: 'Identity::Google') }

    # Search for all identities with the given email
    def self.find_by_email(email)
      where("provider_data ->> 'email' = ?", email)
    end

    # Search for an identity with the given auth hash.
    def self.search(auth)
      find_by_provider_and_uid(auth[:provider], auth[:uid])
    end

    # Returns a hash containing information about all available providers
    # The available providers are loaded from the sqlino file
    def self.all_client_information
      Rails.configuration.sqlino[:auth_provider].map do |k|
        # Grab the class that matches the provided name
        provider_info = k.constantize
        # Extract the relevant client data
        provider_info.client_information.slice(:name, :url_name, :icon, :color)
      end
    end

    # Creates an identity with omniauth callback or create_identity_data,
    # create_identity_data takes the posted values and put them into a hash
    def self.create_with_auth(auth, user)
      if (user.eql? User.guest) then
        user = User.create_from_hash(auth)
      end

      case auth[:provider]
      when 'developer'
        identity = ::Identity::Developer.create_with_auth(auth, user)
      when 'keycloakopenid'
        identity = ::Identity::Keycloak.create_with_auth(auth, user)
      else
        raise RuntimeError.new("Unknown provider: #{auth[:provider]}")
      end

      # checks if someone has already registered this email
      if ((identity.email && User.has_someone_email?(identity.email) && (not user.email.eql?(identity.email)))) then
        raise EsqulinoError::Base.new("E-mail already taken")
      end

      # If the user has no primary e-mail
      if ((not user.email) and identity.confirmed?) then
        user.email = identity.email
      end

      if (user.invalid?) then
        raise EsqulinoError::Base.new(user.errors.full_messages[0])
      end

      if (identity.invalid?) then
        raise EsqulinoError::Base.new(identity.errors.full_messages[0])
      end

      identity.save!
      user.save!

      if user.email?
        user.add_role(:validated)
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
        :access_token_duration => self.access_token_duration ? Time.at(self.access_token_duration) : nil,
      }).compact
    end

    # Updates the current provider data.
    # Will be triggerd when a user is logging in.
    def update_provider_data(hash)
      self.provider_data = self.provider_data.deep_merge(
        hash[:info].merge({
                            credentials: hash[:credentials]
                          })
      )
    end

    # Comes from Omniauth and contains an access/refresh token from oauth2
    def credentials
      return self.provider_data["credentials"]
    end

    def acces_token_expires?
      return self.credentials["expires"]
    end
  end
end
