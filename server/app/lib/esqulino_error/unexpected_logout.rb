module EsqulinoError
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