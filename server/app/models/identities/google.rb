class Google < Identity
  def self.create_with_auth(auth, user)
    Google.create(:user => user, :uid => auth[:uid], :provider => auth[:provider], :data => auth[:info])
  end

  # Google tells us whether the mail is valid
  def confirmed?
    self.data["email_verified"]
  end

  # Github provides the mail in the JSON blob
  def email
    self.data["email"]
  end
end