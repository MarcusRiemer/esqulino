module CurrentUserHelper
  # Each request is expected to provide two JWT tokens which can be used to
  # identify the user who is making that request.
  #
  # This method will try the following things to associate a user with the
  # request:
  #
  # 1) If now tokens are present, the user is assumed to be a guest.
  # 2) If a valid browser_access_token is present, the user_id of that
  #    token denotes the user.
  # 3) If the browser_access_token has expired, the browser_refresh_token
  #    specifies the identity that was used to login that user. In this
  #    case it is up to the identity to verify whether the given token
  #    is still a valid way to identify a user. This may require requests
  #    to third party services.
  #
  # If any tokens are present, any errors in this context must lead to
  # an exception. It doesn't matter whether this is due to the token
  # being tampered with, a third party service being down, ...
  #
  # @param browser_access_token [String]
  #   The JWT-string that the request has provided.
  #   This contains the `user_id` and the relevant roles.
  # @param brwoser_refresh_token [String]
  #   The JWT-string that the request has provided for the refresh token.
  #   This primarily contains the `provider_id`.
  # @return [User]
  #   A valid user (which may be the guest user)
  def validate_user_from_tokens(
    browser_access_token:,
    browser_refresh_token:
  )
    User.guest if browser_access_token.nil? and browser_refresh_token.nil?
  end
end
