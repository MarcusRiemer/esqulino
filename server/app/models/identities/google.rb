class Google < Identity
  def self.create_with_auth(auth, user)
    auth[:info]["confirmed"] = true

    Google.create(:user => user, :uid => auth[:uid], :provider => auth[:provider], :data => auth[:info])
  end
end