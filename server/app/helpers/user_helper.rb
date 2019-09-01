module UserHelper
  include JwtHelper
  
  # Had to be written into a helper, since
  # access to the request object is not 
  # possible within the model.
  def user_information(current = nil)
    begin
      return current ? current_user.information : (get_private_claim() || current_user.information)
    rescue EsqulinoError => e
      raise EsqulinoError.new(e.message)
    end
  end

  # A user is logged in if a HTTP-request contains a cookie with a value that is a valid jwt
  # if there was no jwt, the current user will be set to the guest user
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

  # A user is logged in if he is not the guest user
  def signed_in?
    return (not current_user.eql? User.guest)
  end

  # sign in sets the current user and response with a jwt
  def sign_in(identity)
    if (not signed_in?) then
      current_user = identity.user
      token = JwtHelper.encode(current_user.information)
      response_jwt_cookie(token)
    end
  end

  # Sets the current user to the guest user and deletes the jwt
  def sign_out!
    if (signed_in?) then
      self.current_user = User.guest
      self.delete_jwt_cookie!
    end
  end

  # Deleting a jwt is done by setting the expiration time of the cookie
  def delete_jwt_cookie!()
    current_jwt = nil
    self.current_user = nil

    response_jwt_cookie("", 0.seconds.from_now)
  end
end