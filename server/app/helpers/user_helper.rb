module UserHelper
  include JwtHelper
  
  # Had to be written into a helper, since
  # access to the request object is not 
  # possible within the model.
  def user_information
    return (get_private_claim() || current_user.information)
  end

  # A user is logged in if a HTTP-request contains a cookie with a value that is a valid jwt
  # if there was no jwt, the current user will be set to the guest user
  def current_user
    if (not @current_user) then
      begin
        acces_token = current_acces_token
        if (acces_token) then
          self.current_user = User.find(current_acces_token[:user_id].to_s)
        else
          sign_out!
        end
      rescue ActiveRecord::RecordNotFound => e
        raise EsqulinoError.new(e.message)
      end
    end
    return @current_user
  end

  def current_user=(user)
    @current_user = user
  end

  # Is used for logging out a user
  def clear_current_user
    @current_user = nil
  end

  # A user is logged in if he is not the guest user
  def signed_in?
    return (not current_user.eql? User.guest)
  end

  # sign in sets the current user and response with a jwt
  def sign_in(identity, acces_token_duration = nil)
    if (not signed_in?) then
      payload = identity.user.information

      if (acces_token_duration) then
        response_secure_cookie("REFRESH_TOKEN",
          JwtHelper.encode({user_id: identity.user.id}, 5.days.from_now)
        )
      end

      response_secure_cookie("ACCES_TOKEN", JwtHelper.encode(payload, 10.seconds.from_now))
    end
  end

  # Sets the current user to the guest user and deletes the jwt
  def sign_out!
    if (refresh_cookie) then
      self.delete_refresh_cookie!
    end

    self.delete_acces_cookie!
    self.current_user = User.guest
  end

  def delete_secure_cookie(name)
    self.clear_current_user
    clear_current_acces_token

    response_secure_cookie(name, "", 0.seconds.from_now)
  end

  # Deleting a jwt is done by setting the expiration time of the cookie
  def delete_acces_cookie!()
    delete_secure_cookie("ACCES_TOKEN")
  end

  def delete_refresh_cookie!()
    delete_secure_cookie("REFRESH_TOKEN")
  end
end