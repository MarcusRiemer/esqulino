module JwtHelper
  SECRET_KEY = Rails.application.secrets.secret_key_base. to_s

  def current_jwt=(jwt)
    @current_jwt = jwt
  end

  def current_jwt
    if (not @current_jwt) then
      jwt = request.cookies['JWT']
      if (jwt) then
        self.current_jwt = JwtHelper.decode(jwt)
      end
    end
    return @current_jwt
  end

  def self.encode(payload, exp = 24.hours.from_now)
    payload[:exp] = exp.to_i
    JWT.encode(payload, SECRET_KEY)
  end

  def self.decode(token)
    decoded = JWT.decode(token, SECRET_KEY)[0]
    HashWithIndifferentAccess.new decoded
  end

  # Only data the client receives
  def private_claim_response
    if (current_jwt) then
      to_return = {
        user_id: current_jwt[:user_id],
        display_name: current_jwt[:display_name],
        roles: current_jwt[:roles],
        email: current_jwt[:email]
      }
    end
    return to_return
  end

  def response_jwt_cookie(value, expires = 1.day.from_now)
    response.set_cookie('JWT', {
      value: value,
      httponly: true,
      expires: expires,
      path: '/'
    })
  end
end