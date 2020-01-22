module JwtHelper
  # Is used for signing the JWT
  def self.secret_key
    return Rails.application.secrets.secret_key_base.to_s
  end

  # Is used for issuer claim
  def self.issuer
    return Rails.configuration.sqlino[:editor_domain]
  end

  # Returns the default duration of an access token
  def self.access_token_duration
    return Rails.configuration.sqlino[:auth_tokens][:access_token].seconds
  end

  # Returns the default duration of an refresh token
  def self.refresh_token_duration
    return Rails.configuration.sqlino[:auth_tokens][:refresh_token].seconds
  end

  def self.access_cookie_duration
    duration = Rails.configuration.sqlino[:auth_tokens][:access_cookie]
    # nil value means session duration
    return duration ? duration.seconds : duration
  end

  def self.refresh_cookie_duration
    return Rails.configuration.sqlino[:auth_tokens][:refresh_cookie].seconds
  end

  def self.append_registered_claims(payload = {}, duration = access_token_duration.from_now)
    return payload.merge({exp: duration.to_i, iss: JwtHelper.issuer})
  end

  def self.encode(payload, duration = JwtHelper.access_token_duration.from_now)
    payload = JwtHelper.append_registered_claims(payload, duration)
    JWT.encode(payload, JwtHelper.secret_key)
  end

  def self.decode(token, options = {})
    decoded = JWT.decode(token, JwtHelper.secret_key, true, options)[0]
    # Acces with symbols and strings
    HashWithIndifferentAccess.new decoded
  end

  def access_cookie
    return request.cookies["ACCESS_TOKEN"]
  end

  def refresh_cookie
    return request.cookies["REFRESH_TOKEN"]
  end

  # Only data from the JWT that the client receives
  def get_private_claim
    if (current_access_token) then
      to_return = {
        user_id: current_access_token[:user_id],
        display_name: current_access_token[:display_name],
        roles: current_access_token[:roles],
        email: current_access_token[:email]
      }
    end
    return to_return
  end

  # Should a JWT exist, update with the current user information.
  # Used, for example, when attributes of a user change
  def update_private_claim
    if (current_access_token) then
      duration = JwtHelper.access_token_duration.from_now
      payload = current_user.information
      access_token = JwtHelper.encode(payload, duration)
      @current_access_token = payload

      response_access_cookie(access_token)
    end
  end

  # Clears the current_access_token
  def clear_current_access_token
    @current_access_token = nil
  end

  def clear_current_refresh_token
    @current_refresh_token = nil
  end

  def current_refresh_token
    return @current_refresh_token
  end

  # If the request contains a cookie with jwt, set the current_jwt
  # currernt_jwt is used for accessing to the requested jwt
  #
  # @param attempt_refresh [Boolean] Defines whether an attempt
  # to refresh an expired access_token should be made. In the case
  # of login or logout operations this is not helpful.
  def current_access_token(attempt_refresh = true)
    if (not @current_access_token) then
      access_token = self.access_cookie
      refresh_token = self.refresh_cookie
      if (access_token || refresh_token) then
        begin
          # If everything is fine, decoding the data from the client should be enough
          @current_access_token = JwtHelper.decode(access_token)
        rescue JWT::DecodeError => accessError
          # Even if something went wrong, skipping the refresh may be the way to go.
          # This is the case if the ACCESS_TOKEN might be overridden anyway (e.g.
          # on login or logout)
          if (not attempt_refresh)
            return nil
          end

          # If the access_token is expired check for a refresh token.
          # A valid refresh token may renew the access token
          if (not refresh_token) then
            raise EsqulinoError::UnexpectedLogout.new(
                    message: "Error decoding ACCESS_TOKEN, no REFRESH_TOKEN present",
                    inner_exception: accessError
                  )
          end

          begin
            # We use the REFRESH_TOKEN the client send to update the ACCESS_TOKEN
            @current_refresh_token = JwtHelper.decode(refresh_token, {
                                                        verify_expiration: false
                                                      })

            exp_client_refresh_token = Time.at(@current_refresh_token[:exp]).utc
            user_id = @current_refresh_token[:user_id]
            identity = Identity::Identity.find(@current_refresh_token[:identity_id])

            # If the current REFRESH_TOKEN is expired it may be updated if the provider
            # who provided it is fine with that.
            if (Time.current > exp_client_refresh_token)
              # If the local copy of the providers access token is expired, we need
              # to ask that provider to give us a new one ...
              if identity.access_token_expired?
                identity.refresh_access_token
                identity.save!
              end

              # ... and then we can renew the REFRESH_TOKEN that we send back to the client.
              renew_refresh_token(user_id, identity)
            end

            # The ACCESS_TOKEN should be renewed with every request where it has
            # been touched
            renew_access_token(user_id)

          rescue JWT::DecodeError => accessError
            # Specifically tell what token is broken
            raise EsqulinoError::UnexpectedLogout.new(
                    message: "Error decoding REFRESH_TOKEN",
                    inner_exception: accessError
                  )
          rescue EsqulinoError::UnexpectedLogout
            # Pass through unexpected logouts as they are
            raise
          rescue => e
            # Everything else must be treated as an unexpected logout
            raise EsqulinoError::UnexpectedLogout.new(
                    message: "General error during ACCESS_TOKEN retrieval",
                    inner_exception: e
                  )
          end
        end
      end
    end

    return @current_access_token
  end

  def renew_access_token(uid)
    user = User.find_by(id: uid)
    payload = JwtHelper.append_registered_claims(user.information)
    duration = JwtHelper.access_token_duration.from_now
    access_token = JwtHelper.encode(payload, duration)
    @current_access_token = payload

    response_access_cookie(access_token)
  end

  def renew_refresh_token(uid, identity)
    duration = identity.access_token_duration || JwtHelper.refresh_token_duration
    payload = { user_id: uid, identity_id: identity.id }
    refresh_token = JwtHelper.encode(payload, duration)
    @current_refresh_token = refresh_token

    response_refresh_cookie(refresh_token)
  end

  # Removes all local and remote traces of the ACCESS_TOKEN
  # and the REFRESH_TOKEN
  def clear_secure_cookies
    # Unset both cookies on the client
    self.delete_refresh_cookie!
    self.delete_access_cookie!

    if (self.refresh_cookie) then
      self.clear_current_refresh_token
    end

    if (self.access_cookie) then
      self.clear_current_access_token
    end
  end

  def delete_secure_cookie(name)
    response_secure_cookie(name, "", 300.seconds.before)
  end

  # Deleting a jwt is done by setting the expiration time of the cookie
  def delete_access_cookie!()
    delete_secure_cookie("ACCESS_TOKEN")
  end

  def delete_refresh_cookie!()
    delete_secure_cookie("REFRESH_TOKEN")
  end

  # Response with a jwt in a cookie
  # value: JWT
  # httpOnly: Cookie can not be accessed with JS
  def response_secure_cookie(name, value, expires)
    response.set_cookie(name, {
      value: value,
      httponly: true,
      expires: expires,
      path: '/api',
      domain: "." + Rails.application.config.cookie_domain
    })
  end

  def response_refresh_cookie(refresh_token)
    response_secure_cookie("REFRESH_TOKEN", refresh_token, JwtHelper.refresh_cookie_duration.from_now)
  end

  def response_access_cookie(access_token)
    response_secure_cookie("ACCESS_TOKEN", access_token, JwtHelper.access_cookie_duration)
  end
end