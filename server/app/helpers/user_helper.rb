module UserHelper
  include JwtHelper
  
  def user_information
    begin
      return (private_claim_response || current_user.informations)
    rescue EsqulinoError => e
      raise EsqulinoError.new(e.message)
    end
  end

  def current_user
    if (not @current_user) then
      token = request.cookies['JWT']
      if token
        begin
          self.current_user = User.find(current_jwt[:user_id].to_s)
        rescue ActiveRecord::RecordNotFound => e
          raise EsqulinoError.new(e.message)
        rescue JWT::DecodeError => e
          raise EsqulinoError.new(e.message)
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
      self.current_user = User.guest
      delete_jwt_cookie!
    end
  end

  def delete_jwt_cookie!()
    current_jwt = nil
    self.current_user = nil

    response_jwt_cookie("", 0.seconds.from_now)
  end
end