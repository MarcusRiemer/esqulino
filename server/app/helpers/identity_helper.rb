require 'bcrypt'

module IdentityHelper
  include BCrypt

  def create_identity(auth = request.env["omniauth.auth"], email = false)
    @identity = Identity.search(auth)
    if !@identity
      @identity = Identity.create_with_auth(auth, @current_user) || PasswordIdentity.intern_provider(@current_user[:id]).first
      if (email) 
        IdentityMailer.confirm_email(@identity, request_locale).deliver
      end
    end
  end

  def search_for_identity(permited_params)
    uid = permited_params[:email] || permited_params[:uid]
    return PasswordIdentity.search({
      provider: "identity",
      uid: uid
    })
  end
end