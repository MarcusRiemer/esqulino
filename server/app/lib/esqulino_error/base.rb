module EsqulinoError
  # The most general error, this base-class is required
  # to distinguish "ordinary" ruby errors from those that are
  # specific to the application.
  class Base < StandardError
    attr_reader :code

    # esqulino errors always provide a human readable error message
    # and a status code following the HTTP status code conventions
    #
    # @param msg [string] The user-facing error message
    # @param code [integer] The HTTP status code
    # @param impl_error [bool] True, if this error shouldn't have been
    #                          shown to the user.
    def initialize(msg="Internal Esqulino Error", code=500, impl_error = false)
      @code = code
      @impl_error = impl_error
      super msg
    end

    # Used by Sinatra to serialize this error in a meaningful
    # representation for clients.
    def to_json(options)
      self.to_liquid.to_json(options)
    end

    # Can be used by specialised classes to provide additional
    # error context.
    #
    # @return [Hash] Additional error information
    def json_data()
      {  }
    end

    # Liquid representation is identical to JSON
    def to_liquid
      {
        "code" => @code,
        "message" => self.to_s,
        "type" => self.class.name,
        "implError" => @impl_error
      }.merge(json_data)
    end
  end
end