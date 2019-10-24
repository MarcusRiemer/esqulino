module Identity
  # The Google provider comes from https://github.com/zquestz/omniauth-google-oauth2
  class Google < Identity
    # This URL is mandated by Google to update
    REFRESH_TOKEN_URL = "https://accounts.google.com/o/oauth2/token"

    scope :find_by_email, -> (email) {
      where("provider_data ->> 'email' = ?", email)
    }

    # Creates a google identity with the given hash and user
    def self.create_with_auth(auth, user)
      new(
        :user => user,
        :uid => auth[:uid],
        :provider => auth[:provider],
        :provider_data => auth[:info].merge({ credentials: auth[:credentials] }),
        :own_data => {}
      )
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

    # Asks Google whether the token that we currently have is still valid
    def refresh_access_token
      response = RestClient.post(
        REFRESH_TOKEN_URL,
        :grant_type => 'refresh_token',
        :refresh_token => self.credentials["token"],
        :client_id => Rails.configuration.sqlino[:auth_provider_keys][:google_id],
        :client_secret => Rails.configuration.sqlino[:auth_provider_keys][:google_secret]
      )
      parsed_response = JSON.parse(response.body)
      sliced_response = parsed_response.slice("access_token","expires_in")

      if (sliced_response.keys.length != 2)
        raise EsqulinoError::Base.new("Malformed response from Google: #{sliced_response}")
      end

      self.credentials["access_token"] = sliced_response["access_token"]
      self.credentials["expires_at"] = (Time.current + sliced_response["expires_in"]).to_i
    rescue RestClient::BadRequest => err
      raise EsqulinoError::Base.new("Refreshing Access Token failed: #{err}")
    end
  end
end