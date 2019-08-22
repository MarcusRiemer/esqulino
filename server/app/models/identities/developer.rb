class Developer < Identity
  def self.create_with_auth(auth, user)
    new(:user => user, :uid => auth[:uid], :provider => auth[:provider], :provider_data => auth[:info], :own_data => {})
  end
  # Developers are never confirmed manually, we always believe them
  def confirmed?
    true
  end

  def email
    self.uid
  end

  def self.client_informations
    return ({
      name: "Developer",
      url_name: "developer",
      icon: "fa-user",
      color: "LightSlateGray"
    })
  end
end