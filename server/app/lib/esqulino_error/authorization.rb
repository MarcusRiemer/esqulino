module EsqulinoError
  # Some authentication went wrong
  class Authorization < Base
    def initialize(msg = "Unauthorized", code = 401)
      super msg, code
    end
  end
end
