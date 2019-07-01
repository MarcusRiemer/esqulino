class Google < Identity
  scope :find_by_email, -> (email) { 
    where("provider_data ->> 'email' = ?", email)
  }

  def self.create_with_auth(auth, user)
    Google.create(:user => user, :uid => auth[:uid], :provider => auth[:provider], :provider_data => auth[:info], :own_data => {})
  end

  # Google tells us whether the mail is valid
  def confirmed?
    return self.provider_data["email_verified"]
  end

  # Github provides the mail in the JSON blob
  def email
    return self.provider_data["email"]
  end
end