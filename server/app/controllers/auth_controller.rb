class AuthController < ApplicationController
  include AuthHelper
  include UserHelper
  include LocaleHelper

  # This function is essential for omniauth.
  # If youre authenticated by the external provider, you will be
  # navigated to this function.
  def callback
    auth_hash = request.env.fetch("omniauth.auth")

    identity = Identity.search(auth_hash)
    if (not identity) then
      identity = Identity.create_with_auth(auth_hash, current_user)
    else
      if (signed_in?) and (not current_user.eql? identity.user) then
        raise RuntimeError.new("Error: already linked with a user")
      end

      identity.update_provider_data(auth_hash)
      identity.save!
    end
    sign_in(identity, identity.access_token_duration)

    # The HTTP referer identifies the address of the webpage
    # which is linked to the resource being requested
    # **omniauth.origin** Omniauth is saving the user location
    redirect_to (request.env['omniauth.origin'] || URI(request.referer || "/").path)
  end

  # Function is called by omniauth identity and
  # is used to login a user with password
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

    sign_in(identity, identity.access_token_duration)
    api_response(user_information)
  end

  # This register function is only for the identity provider.
  # You use this for creating an identity with a password
  # with simulated callback data
  def register
    auth_hash = create_identity_data(register_params)
    identity = Identity.search(auth_hash)
    # If a user is logged in, response with linked identities
    if (current_user)
      to_response = current_user.all_providers
    end

    if (not identity) then
      identity = Identity.create_with_auth(auth_hash, current_user)
      # sends an confirmation e-mail
      IdentityMailer.confirm_email(identity, request_locale).deliver unless Rails.env.test?
      api_response(to_response ? to_response : current_user.information)
    else
      error_response("E-mail already registered")
    end
  end

  # Sign out a user
  def destroy
    sign_out!
    api_response(current_user.information)
  end

  # Failure will be called by omniauth.
  # For example if someone tries csrf
  def failure
    error_response(params[:message])
  end

  private

  def register_params
    params
        .permit([:email, :username, :password])
  end

  def login_params
    params
        .permit([:email, :password])
  end
end
