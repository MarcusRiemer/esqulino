require 'bcrypt'

module IdentityHelper
  include BCrypt
  include LocaleHelper

  # Creates an identity with omniauth callback or with create_identity_data,
  # create_identity_data takes the posted values and put them into a hash
  def create_identity(auth = request.env["omniauth.auth"], email = false)
    @identity = Identity.search(auth)
    if !@identity
      user = @current_user || User.create_from_hash(auth)

      case auth[:provider]
      when 'developer'
        @identity = Developer.create_with_auth(auth, user)
      when 'identity'
        @identity = PasswordIdentity.create_with_auth(auth, user)
      when 'google_oauth2'
        @identity = Google.create_with_auth(auth, user)
      when 'github'
        @identity = Github.create_with_auth(auth, user)
      else
        raise Exception.new('Unknown Provider')
      end

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
end