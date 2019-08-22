class Github < Identity
  scope :find_by_email, -> (email) { 
    where("provider_data ->> 'email' = ?", email)
  }

  def self.create_with_auth(auth, user)
    new(:user => user, :uid => auth[:uid], :provider => auth[:provider], :provider_data => auth[:info], :own_data => {})
  end

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

  def link
    return self.provider_data["urls"]["GitHub"]
  end

  # Github provides the mail in the JSON blob
  def email
    return self.provider_data["email"]
  end

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
end