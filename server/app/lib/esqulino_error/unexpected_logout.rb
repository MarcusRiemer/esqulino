module EsqulinoError
  # Something during the authentication process has failed in a unpredictable
  # manner. This is usually due to a third party identity provider not
  # renewing a token but could also be caused by tokens that were modified.
  #
  # Raising this exception will logout the user by resetting his cookies
  # as part of the response (unless rescued before of course).
  class UnexpectedLogout < Base
    def initialize(
          message: 'Unexpected Logout',
          code: 400,
          inner_exception: nil
        )
      super message, code
      @inner_exception = inner_exception
    end

    def json_data()
      {
        "innerException": @inner_exception.inspect
      }
    end
  end
end