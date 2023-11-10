module UserHelper
  include JwtHelper

  # Had to be written into a helper, since
  # access to the request object is not
  # possible within the model.
  def user_information
    (get_private_claim || current_user.information)
  end

  # A user is logged in if a HTTP-request contains a cookie with a value that is a valid jwt.
  # If there was no jwt, the current user will be set to the guest user.
  #
  # @param attempt_refresh [Boolean]
  #   Defines whether an attempt to refresh an expired access_token should be
  #   made. In the case of login or logout operations this is not helpful.
  def current_user(attempt_refresh = true)
    # @current_user may only be nil if this method was never called before
    unless @current_user
      access_token = current_access_token(attempt_refresh)
      @current_user = if access_token
                        User.find(current_access_token[:user_id].to_s)
                      else
                        User.guest
                      end
    end

    @current_user
  end

  # Is used for logging out a user
  def clear_current_user
    @current_user = User.guest
  end

  # A user is logged in if he is not the guest user
  def signed_in?
    (!current_user.eql? User.guest)
  end

  def ensure_is_logged_in(&block)
    raise EsqulinoError::Base.new('Not logged in', 401) unless signed_in?

    block.call
  end

  # Sets the relevant tokens a user needs to identify himself.
  #
  # @param identity [Identity] The identity that was used to authenticate the user
  # @param refresh_token_duration [Integer] Duration of the session from now on (in s)
  def sign_in(identity, refresh_token_duration = JwtHelper.refresh_token_duration.from_now)
    refresh_token_duration ||= JwtHelper.refresh_token_duration.from_now

    payload = identity.user.information
    refresh_token = JwtHelper.encode({
                                       user_id: identity.user.id,
                                       identity_id: identity.id
                                     }, refresh_token_duration)

    # Time will be automatically converted into GMT
    response_refresh_cookie(refresh_token)
    response_access_cookie(JwtHelper.encode(payload))
  end

  # Sets the current user to the guest user and deletes the jwt
  def sign_out!
    clear_current_user
    clear_secure_cookies
  end
end
