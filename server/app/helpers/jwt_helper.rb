module JwtHelper
  SECRET_KEY = Rails.application.secrets.secret_key_base. to_s

  def self.encode(payload, exp = 24.hours.from_now)
    payload[:exp] = exp.to_i
    JWT.encode(payload, SECRET_KEY)
  end

  def self.decode(token)
    decoded = JWT.decode(token, SECRET_KEY)[0]
    HashWithIndifferentAccess.new decoded
  end

  # Only the data the client receives
  def private_claim_response
    if (current_jwt) then
      to_return = {
        user_id: current_jwt[:user_id],
        display_name: current_jwt[:display_name],
        roles: current_jwt[:roles]
      }
    end
    return to_return
  end
end