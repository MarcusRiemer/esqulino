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

  def acces_token_duration
    return self.credentials["expires_at"]
  end

  def acces_token_expired?
    return self.acces_token_duration < Date.today.to_time.to_i
  end
end