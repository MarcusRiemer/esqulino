class Developer < Identity
  def self.create_with_auth(auth, user)
    Developer.create(:user => user, :uid => auth[:uid], :provider => auth[:provider], :data => auth[:info])
  end

  # Developers are never confirmed manually, we always believe them
  def confirmed?
    true
  end

  def email
    self.uid
  end
end