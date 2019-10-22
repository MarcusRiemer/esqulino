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
      access_token = current_access_token
      if (access_token) then
        begin
          @current_user = User.find(current_access_token[:user_id].to_s)
        rescue ActiveRecord::RecordNotFound => err
          raise EsqulinoError.new(err.message)
        end
      end
    end

    return @current_user || User.guest
  end

  # Is used for logging out a user
  def clear_current_user
    @current_user = User.guest
  end

  # A user is logged in if he is not the guest user
  def signed_in?
    return (not current_user.eql? User.guest)
  end

  def ensure_is_logged_in(&block)
    if (signed_in?)
      block.call
    else
      api_response(self.current_user.information)
    end
  end

  # sign in sets the current user and response with a jwt
  def sign_in(identity, refresh_token_duration = JwtHelper.refresh_token_duration.from_now)
    refresh_token_duration ||= JwtHelper.refresh_token_duration.from_now
    if (not signed_in?) then
      payload = identity.user.information
      refresh_token = JwtHelper.encode({
        user_id: identity.user.id,
        identity_id: identity.id
      }, refresh_token_duration)

      # Time will be automatically converted into GMT 
      response_refresh_cookie(refresh_token)
      response_access_cookie(JwtHelper.encode(payload))
    end
  end

  # Sets the current user to the guest user and deletes the jwt
  def sign_out!
    self.clear_current_user
    clear_secure_cookies()
  end
end