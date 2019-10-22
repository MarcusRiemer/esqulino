module EsqulinoError
  class Jwt < Base
    def initialize(msg = "JWT decode error", code = 500)
      super msg, code
    end

    def json_data
      {
        "newUser" => User.guest.information
      }
    end
  end
end