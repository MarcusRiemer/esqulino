module JwtHelper
  # SECRET_KEY is used for signing the JWT
  SECRET_KEY = Rails.application.secrets.secret_key_base. to_s
 
  def self.encode(payload, exp = 1.hours.from_now)
    payload[:exp] = exp.to_i
    JWT.encode(payload, SECRET_KEY)
  end

  def self.decode(token)
    decoded = JWT.decode(token, SECRET_KEY)[0]
    # Acces with symbols and strings
    HashWithIndifferentAccess.new decoded
  end

  # Only data from the JWT that the client receives
  def get_private_claim
    if (current_jwt) then
      to_return = {
        user_id: current_jwt[:user_id],
        display_name: current_jwt[:display_name],
        roles: current_jwt[:roles],
        email: current_jwt[:email]
      }
    end
  end

  # Should a JWT exist, update with the current user information.
  # Used, for example, when attributes of a user change
  def update_private_claim
    if (current_jwt) then
      response_jwt_cookie(JwtHelper.encode(current_user.information))
    end
  end

  # Sets the current_jwt
  def current_jwt=(jwt)
    @current_jwt = jwt
  end

  # If the request contains a cookie with jwt, set the current_jwt
  # currernt_jwt is used for accesing to the requested jwt
  def current_jwt
    if (not @current_jwt) then
      jwt = request.cookies['JWT']
      if (jwt) then
        self.current_jwt = JwtHelper.decode(jwt)
      end
    end
    return @current_jwt
  end

  # Response with a jwt in a cookie
  # value: JWT
  # httpOnly: Cookie can not be accessed with JS
  def response_jwt_cookie(value, expires = 1.day.from_now)
    response.set_cookie('JWT', {
      value: value,
      httponly: true,
      expires: expires,
      path: '/'
    })
  end
end