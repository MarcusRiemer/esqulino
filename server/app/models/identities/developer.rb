# The developer provider is already provided 
# by Omniauth and should NOT!!! be present in the production system
class Developer < Identity
  # Creates a developer identity with the given hash and user
  def self.create_with_auth(auth, user)
    new(
      :user => user,
      :uid => auth[:uid],
      :provider => auth[:provider],
      :provider_data => auth[:info].merge({
        credentials: {
          expires: false
        }}
      ),
      :own_data => {}
    )
  end

  # Client side information for the developer provider
  def self.client_information
    return ({
      name: "Developer",
      url_name: "developer",
      icon: "fa-user",
      color: "LightSlateGray"
    })
  end

  # Developers are never confirmed manually, we always believe them
  def confirmed?
    true
  end

  def email
    self.uid
  end
end