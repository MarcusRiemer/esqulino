class Google < Identity
  scope :find_by_email, -> (email) { 
    where("provider_data ->> 'email' = ?", email)
   .limit(1)
  }

  def self.create_with_auth(auth, user)
    Google.create(:user => user, :uid => auth[:uid], :provider => auth[:provider], :provider_data => auth[:info])
  end

  # Google tells us whether the mail is valid
  def confirmed?
    self.provider_data["email_verified"]
  end

  # Github provides the mail in the JSON blob
  def email
    self.provider_data["email"]
  end
end