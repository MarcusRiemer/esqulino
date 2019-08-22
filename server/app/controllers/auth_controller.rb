class AuthController < ApplicationController
  include AuthHelper
  include UserHelper
  include LocaleHelper

  # This function is essential for omniauth.
  # If youre authenticated by the external provider, you will be 
  # navigated to this function.
  def callback
    begin
      auth_hash = request.env["omniauth.auth"]
      identity = Identity.search(auth_hash)
      if (not identity) then
        identity = create_identity(auth_hash)
      end

      if (signed_in?) and (not current_user.eql? identity.user) then
        raise RuntimeError.new("Error: already linked with a user")
      end

      sign_in(identity)
      redirect_to URI(request.referer || "/").path
    rescue => e
      raise RuntimeError.new(e.message)
    end
  end
  
  def login_with_password
    identity = PasswordIdentity.find_by(uid: login_params[:email])
    if (not identity)
      return error_response("E-Mail not found")
    end

    if (not identity.confirmed?)
      return error_response("Please confirm your e-mail")
    end

    if (not identity.password_eql?(params[:password]))
      return error_response("Wrong password")
    end

    sign_in(identity)
    api_response(user_information)
  end

  # This register function is only for the identity provider.
  # You use this for creating an identity with a password
  # with simulated callback data
  def register
    begin
      auth_hash = create_identity_data(register_params)
      identity = Identity.search(auth_hash)
      if (not identity) then
        identity = create_identity(auth_hash)
        # sends an confirmation e-mail
        IdentityMailer.confirm_email(identity, request_locale).deliver unless Rails.env.test?
        api_response(current_user.information)
      else
        error_response("E-mail already registered")
      end
    rescue => e
      error_response(e.message)
    end
  end

  def destroy
    sign_out!
    delete_jwt_cookie!
    api_response(current_user.information)
  end

  def failure
    error_response(params[:message])
  end

  private

  def create_identity(auth_hash)
    user = current_user
    if (not signed_in?) then
      user = User.create_from_hash(auth_hash)
    end

    identity = Identity.create_with_auth(auth_hash, user)
    return identity
  end

  def register_params
    params
        .permit([:email, :username, :password])
  end

  def login_params
    params
        .permit([:email, :password])
  end
end

