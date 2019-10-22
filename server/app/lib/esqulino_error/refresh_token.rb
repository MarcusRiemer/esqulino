module EsqulinoError
  class RefreshToken < Jwt
    def initialize(msg = "Refresh-Token expired", code = 500)
      super msg, code
    end
  end
end