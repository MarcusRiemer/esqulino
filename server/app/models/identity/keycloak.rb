module Identity
  class Keycloak < Identity
    # Creates a developer identity with the given hash and user
    def self.create_with_auth(auth, user)
      new(
        :user => user,
        :uid => auth[:uid],
        :provider => auth[:provider],
        :provider_data => auth[:info],
        :own_data => {}
      )
    end

    # Client side information for the developer provider
    def self.client_information
      return ({
                name: "Keycloak",
                url_name: "KeycloakOpenId", # NOT the same as the atom for the provider
                icon: "fa-key",
                color: "green"
              })
    end

    def update_provider_data(hash)

    end

    def confirmed?
      return true
    end

    def email
      return provider_data["email"]
    end

    def access_token_duration
      return nil
    end

    def access_token_expired?
      return false
    end

    def refresh_access_token
      # TODO-Tom needs to be added
      nil
    end
  end
end