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
    # return 10.seconds
    return Rails.configuration.sqlino[:auth_tokens][:access_token].seconds
  end
  # Returns the default duration of an refresh token
  def self.refresh_token_duration
    # return 10.seconds
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
  def current_access_token
    if (not @current_access_token) then
      access_token = self.access_cookie
      refresh_token = self.refresh_cookie
      if (access_token || refresh_token) then
        begin
          @current_access_token = JwtHelper.decode(access_token)
        # If the access_token is expired check for a refresh token.
        # A valid refresh token renew the access token
        rescue JWT::DecodeError => accessError
          if (not refresh_token) then
            self.clear_secure_cookies
            raise EsqulinoError::AccessToken.new(accessError.message)
          end

          begin
            @current_refresh_token = JwtHelper.decode(refresh_token, {
              verify_expiration: false
            })

            exp = Time.at(@current_refresh_token[:exp]).utc
            user_id = @current_refresh_token[:user_id]
            user = User.find(user_id)
            identity = Identity.find(@current_refresh_token[:identity_id])
          rescue JWT::DecodeError => refreshError
            self.clear_secure_cookies
            raise EsqulinoError::RefreshToken.new(refreshError.message)
          rescue => e
            self.clear_secure_cookies
            raise EsqulinoError::Base.new(e.message)
          end

        # If the current refresh token is expired try to renew the access token of the provider.
        # The result of an renewd access token is a new blattwerkzeug refresh token
        # Empty access_token & refresh_token means no one is logged in
          if (Time.current > exp)
            user.refresh_token_if_expired(identity)
            if identity.access_token_expired?
              self.clear_secure_cookies
              raise EsqulinoError::RefreshToken.new(refreshError.message)
            end

            renew_refresh_token(user_id, identity)
          end
          renew_access_token(user_id)
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

  def clear_secure_cookies
    if (self.refresh_cookie) then
      self.delete_refresh_cookie!
      self.clear_current_refresh_token
    end

    if (self.access_cookie) then
      self.delete_access_cookie!
      self.clear_current_access_token
    end
  end

  def delete_secure_cookie(name)
    response_secure_cookie(name, "", 0.seconds.from_now)
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