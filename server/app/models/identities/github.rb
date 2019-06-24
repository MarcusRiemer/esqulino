class Github < Identity
  def self.create_with_auth(auth, user)
    auth[:info]["confirmed"] = true

    Github.create(:user => user, :uid => auth[:uid], :provider => auth[:provider], :data => auth[:info])
  end

  # Github (hopefully) validates mails for us
  def confirmed?
    true
  end

  # Github provides the mail in the JSON blob
  def email
    self.data["email"]
  end
end