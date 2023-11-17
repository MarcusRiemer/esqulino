class AuthController < ApplicationController
  include UserHelper
  include LocaleHelper

  # This function is essential for omniauth.
  # If youre authenticated by the external provider, you will be
  # navigated to this function once the external provider has
  # finished whatever it did.
  def callback
    # In this context, there is no sense in trying to renew the
    # ACCESS_TOKEN of the current user, as it will be rewritten
    # anyway
    current_user(false)

    # Shortcut to central Omniauth hash, see
    # https://github.com/omniauth/omniauth/wiki/Auth-Hash-Schema
    auth_hash = request.env.fetch('omniauth.auth')

    # A login via the callback may be from a recurring or from a
    # new user.
    identity = Identity::Identity.search(auth_hash)
    if !identity
      identity = Identity::Identity.create_with_auth(auth_hash, current_user)
    else
      raise 'Error: already linked with a user' if signed_in? and current_user.id != identity.user_id

      identity.update_provider_data(auth_hash)
      identity.save!
    end

    # Set the appropriate cookies
    sign_in(identity, identity.access_token_duration)

    # Where did the user start his login process?
    # 1) Omniauth may have the previous user location
    # 2) Just go back to the root
    #
    # Sadly the previous location that is provided by omniauth may be a API
    # endpoint URL that was used for the login. This *seems* to only happen
    # with the developer identity, but if that is the case we also redirect
    # to the root.
    redirect_url = request.env['omniauth.origin']
    redirect_url = '/' if !redirect_url or redirect_url.include? '/auth/'
    redirect_to redirect_url
  end

  # This register function is only for the identity provider.
  # You use this for creating an identity with a password
  # with simulated callback data
  def register
    auth_hash = create_identity_data(register_params)
    identity = Identity::Identity.search(auth_hash)

    # If a user is logged in, response with linked identities
    to_response = current_user.all_providers if current_user

    if !identity
      identity = Identity::Identity.create_with_auth(auth_hash, current_user)
      # sends an confirmation e-mail
      IdentityMailer.confirm_email(identity, request_locale).deliver unless Rails.env.test?
      api_response(to_response || current_user.information)
    else
      error_response('E-mail already registered')
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
      .permit(%i[email username password])
  end

  def login_params
    params
      .permit(%i[email password])
  end
end
