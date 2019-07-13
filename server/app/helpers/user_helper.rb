module UserHelper
  include JwtHelper
  
  def user_information
    return (private_claim_response || current_user.informations)
  end

  def current_user
    if (not @current_user) then
      token = request.cookies['JWT-TOKEN']
      if token
        begin
          self.current_jwt = JwtHelper.decode(token)
          self.current_user = User.find(current_jwt[:user_id].to_s)
        rescue ActiveRecord::RecordNotFound => e
          raise EsqulinoError.new
        rescue JWT::DecodeError => e
          raise EsqulinoError.new
        end
      else
        self.current_user = User.guest
      end
    end
    return @current_user
  end

  def current_user=(user)
    @current_user = user
  end

  def signed_in?
    return (not current_user.eql? User.guest)
  end

  def sign_in(identity)
    if (not signed_in?) then
      current_user = identity.user
      token = JwtHelper.encode(current_user.informations)
      response_jwt_cookie(token)
    end
  end

  def sign_out!
    if (signed_in?) then
      current_user = User.guest
      delete_jwt_cookie!
    end
  end

  def delete_jwt_cookie!()
    current_jwt = nil
    current_user = nil

    response_jwt_cookie("", 0.seconds.from_now)
  end

  private
  def response_jwt_cookie(value, expires = 1.day.from_now)
    response.set_cookie('JWT-TOKEN', {
      value: value,
      httponly: true,
      expires: expires,
      path: '/'
    })
  end
end