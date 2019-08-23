class Google < Identity
  scope :find_by_email, -> (email) { 
    where("provider_data ->> 'email' = ?", email)
  }

  def self.create_with_auth(auth, user)
    new(:user => user, :uid => auth[:uid], :provider => auth[:provider], :provider_data => auth[:info], :own_data => {})
  end

  # Google tells us whether the mail is valid
  def confirmed?
    return self.provider_data["email_verified"]
  end

  # Github provides the mail in the JSON blob
  def email
    return self.provider_data["email"]
  end

  def self.client_informations
    return ({
      name: "Google",
      url_name: "google_oauth2",
      icon: "fa-google",
      color: "FireBrick"
    })
  end
end