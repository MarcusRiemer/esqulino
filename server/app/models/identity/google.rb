module Identity
  # The Google provider comes from https://github.com/zquestz/omniauth-google-oauth2
  class Google < Identity
    scope :find_by_email, -> (email) {
      where("provider_data ->> 'email' = ?", email)
    }

    # Creates a google identity with the given hash and user
    def self.create_with_auth(auth, user)
      new(
        :user => user,
        :uid => auth[:uid],
        :provider => auth[:provider],
        :provider_data => auth[:info].merge({
                                              credentials: auth[:credentials]}
                                           ),
        :own_data => {})
    end

    # Client side information for the GitHub provider
    def self.client_information
      return ({
                name: "Google",
                url_name: "google_oauth2",
                icon: "fa-google",
                color: "FireBrick"
              })
    end

    # Google tells us whether the mail is valid
    def confirmed?
      return self.provider_data["email_verified"]
    end

    # Github provides the mail in the JSON blob
    def email
      return self.provider_data["email"]
    end

    # TODO-Tom comments
    def access_token_duration
      return Time.at(self.credentials["expires_at"])
    end

    def access_token_expired?
      return self.access_token_duration < Time.current
    end

    def access_token=(access_token)
      self.credentials["access_token"] = access_token
    end

    def refresh_access_token
      # TODO-Tom comments
      response = RestClient.post(
        Rails.configuration.sqlino["auth_refresh_token_urls"]["google"],
        :grant_type => 'refresh_token',
        :refresh_token => self.credentials["refresh_token"],
        :client_id => Rails.configuration.sqlino["auth_provider_keys"]["google_id"],
        :client_secret => Rails.configuration.sqlino["auth_provider_keys"]["google_secret"]
      )
      parsed_response = JSON.parse(response.body)

      if (not parsed_response["access_token"]) then
        raise RefreshAccessTokenError.new("Google: An error occured")
      end

      sliced_response = parsed_response.slice("access_token","expires_in")

      self.credentials["access_token"] = sliced_response["access_token"]
      self.credentials["expires_at"] = (Time.current + sliced_response["expires_in"]).to_i
    end
  end
end