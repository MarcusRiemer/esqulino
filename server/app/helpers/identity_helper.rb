require 'bcrypt'

module IdentityHelper
  include BCrypt
  include LocaleHelper

  def create_identity(auth = request.env["omniauth.auth"], email = false)
    @identity = Identity.search(auth)
    if !@identity
      @identity = Identity.create_with_auth(auth, @current_user)
      if (@identity && email) 
        IdentityMailer.confirm_email(@identity, request_locale).deliver
      end
    end
  end

  def search_for_password_identity(permited_params)
    uid = permited_params[:email] || permited_params[:uid]
    return PasswordIdentity.search({
      provider: "identity",
      uid: uid
    })
  end

  def password_invalid(password)
    return password.length >= 3 && password.length <= 20
  end
end