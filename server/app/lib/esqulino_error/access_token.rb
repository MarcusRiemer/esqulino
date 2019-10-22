module EsqulinoError
  class AccessToken < Jwt
    def initialize(msg = "Access-Token expired", code = 500)
      super msg, code
    end
  end
end