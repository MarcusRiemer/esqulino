module JwtHelper
  # Is used for signing the JWT
  def self.secret_key
    return Rails.application.secrets.secret_key_base.to_s
  end
  # Is used for issuer claim
  def self.issuer
    return Rails.configuration.sqlino['editor_domain']
  end
  # Returns the default duration of an acces token
  def self.acces_token_duration
    # return 10.seconds
    return Rails.configuration.sqlino['auth_tokens']['acces_token'].seconds
  end
  # Returns the default duration of an refresh token
  def self.refresh_token_duration
    return Rails.configuration.sqlino['auth_tokens']['refresh_token'].seconds
  end

  def self.append_registered_claims(payload = {}, duration = acces_token_duration.from_now)
    return payload.merge({exp: duration.to_i, iss: JwtHelper.issuer})
  end

  def self.encode(payload, duration = acces_token_duration.from_now)
    payload = JwtHelper.append_registered_claims(payload, duration)
    JWT.encode(payload, JwtHelper.secret_key)
  end

  def self.decode(token)
    decoded = JWT.decode(token, JwtHelper.secret_key)[0]
    # Acces with symbols and strings
    HashWithIndifferentAccess.new decoded
  end

  def acces_cookie
    return request.cookies["ACCES_TOKEN"]
  end

  def refresh_cookie
    return request.cookies["REFRESH_TOKEN"]
  end

  # Only data from the JWT that the client receives
  def get_private_claim
    if (current_acces_token) then
      to_return = {
        user_id: current_acces_token[:user_id],
        display_name: current_acces_token[:display_name],
        roles: current_acces_token[:roles],
        email: current_acces_token[:email]
      }
    end

    return to_return
  end

  # Should a JWT exist, update with the current user information.
  # Used, for example, when attributes of a user change
  def update_private_claim
    if (current_acces_token) then
      response_secure_cookie("ACCES_TOKEN",
        JwtHelper.encode(current_user.information, JwtHelper.acces_token_duration.from_now)
      )
    end
  end

  # Clears the current_acces_token
  def clear_current_acces_token
    @current_acces_token = nil
  end

  # If the request contains a cookie with jwt, set the current_jwt
  # currernt_jwt is used for accesing to the requested jwt
  def current_acces_token
    if (not @current_acces_token) then
      acces_token = self.acces_cookie
      begin
        @current_acces_token = JwtHelper.decode(acces_token)
      # If the acces_token is expired check for a refresh token.
      # A valid refresh token renew the acces token
      rescue JWT::ExpiredSignature => e
        refresh_token = self.refresh_cookie
        begin
          user_id = JwtHelper.decode(refresh_token)[:user_id]
          @current_acces_token = renew_acces_token(user_id)
        # If an decode error occurs the user will be classified as guest
        # Empty acces_token means no one is logged in
        rescue JWT::DecodeError => e
          @current_acces_token = nil
        end
      rescue JWT::DecodeError => e
        @current_acces_token = nil
      end
    end
    return @current_acces_token
  end

  def renew_acces_token(uid)
    user = User.find_by(id: uid)
    payload = JwtHelper.append_registered_claims(user.information)
    acces_token = JwtHelper.encode(payload, JwtHelper.acces_token_duration.from_now)

    response_secure_cookie("ACCES_TOKEN", acces_token)

    return payload
  end

  # Response with a jwt in a cookie
  # value: JWT
  # httpOnly: Cookie can not be accessed with JS
  def response_secure_cookie(name, value, expires = 1.day.from_now)
    response.set_cookie(name, {
      value: value,
      httponly: true,
      expires: expires,
      path: '/api',
      domain: "." + Rails.application.config.cookie_domain
    })
  end
end