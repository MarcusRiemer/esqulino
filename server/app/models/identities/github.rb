# The GitHub provider comes from https://github.com/omniauth/omniauth-github
class Github < Identity
  # Search for all GitHub identities with the given email
  scope :find_by_email, -> (email) { 
    where("provider_data ->> 'email' = ?", email)
  }

  # Creates a github identity with the given hash and user
  def self.create_with_auth(auth, user)
    new(
      :user => user,
      :uid => auth[:uid], 
      :provider => auth[:provider], 
      :provider_data => auth[:info].merge({
        credentials: auth[:credentials]}
      ),
      :own_data => {}
    )
  end

  # Client side information for the GitHub provider
  def self.client_information
    return ({
        name: "Github",
        url_name: "github",
        icon: "fa-github",
        color: "black"
    })
  end
  
  # Github (hopefully) validates mails for us
  def confirmed?
    return true
  end

  # GitHub returns a link to a user's Github profile
  def link
    return self.provider_data["urls"]["GitHub"]
  end

  # Github provides the mail in the JSON blob
  def email
    return self.provider_data["email"]
  end

  # Creates a hash that is passed to the client
  # contains all information about a current selected identity 
  def to_list_api_response
    return ({
              :id => self.id,
              :type => self.type,
              :link => self.link,
              :email => self.email,
              :confirmed => self.confirmed?,
              :changes => {
                primary: self.change_primary_token_exp
              }
            })
  end

  def access_token_duration
    return nil
  end

  def access_token_expired?
    return false
  end

  def refresh_access_token
    # TODO-Tom needs to be added
  end
end