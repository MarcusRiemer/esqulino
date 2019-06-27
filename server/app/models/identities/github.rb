class Github < Identity
  scope :find_by_email, -> (email) { 
    where("provider_data ->> 'email' = ?", email)
   .limit(1)
  }

  def self.create_with_auth(auth, user)
    auth[:info]["confirmed"] = true

    Github.create(:user => user, :uid => auth[:uid], :provider => auth[:provider], :provider_data => auth[:info])
  end

  # Github (hopefully) validates mails for us
  def confirmed?
    true
  end

  # Github provides the mail in the JSON blob
  def email
    self.provider_data["email"]
  end
end