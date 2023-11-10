module Identity
  # The developer provider is already provided
  # by Omniauth and should NOT!!! be present in the production system
  class Developer < Identity
    def self.credentials
      {
        credentials: {
          expires: false
        }
      }
    end

    # Creates a developer identity with the given hash and user
    def self.create_with_auth(auth, user)
      new(
        user:,
        uid: auth[:uid],
        provider: auth[:provider],
        provider_data: auth[:info].merge(Developer.credentials),
        own_data: {}
      )
    end

    # Client side information for the developer provider
    def self.client_information
      {
        name: 'Developer',
        url_name: 'developer',
        icon: 'fa-user',
        color: 'LightSlateGray'
      }
    end

    def update_provider_data(hash)
      self.provider_data = provider_data.deep_merge(
        hash[:info].merge(Developer.credentials)
      )
    end

    # Developers are never confirmed manually, we always believe them
    def confirmed?
      true
    end

    def email
      uid
    end

    def access_token_duration
      nil
    end

    def access_token_expired?
      false
    end

    def refresh_access_token
      # TODO-Tom needs to be added
      nil
    end
  end
end
