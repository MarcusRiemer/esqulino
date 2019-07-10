require 'bcrypt'

module AuthHelper
  include BCrypt

  # Creates a simulation of auth data. 
  # The structur is similar to the omniauth reponse.
  # Use case: Register with password
  def create_identity_data(permited_params)
    # If the user is already logged in, 
    # choose the current username and password

    if signed_in?
      # Check if there exists an PasswordIdentity
      # because of a logged in user with other provider
      identity = PasswordIdentity.where(user_id: current_user[:id]).first
      if identity
        name = current_user[:display_name]
        password = identity.password
      end
    end

    return auth = {
      provider: "identity",
      uid: permited_params[:email],
      info: {
        name: (name || permited_params[:username]),
        email: permited_params[:email],
      },
      data: {
        password: (password || BCrypt::Password.create(permited_params[:password])),
        verify_token: SecureRandom.uuid,
        confirmed: false,
      }
    }
  end

  def sign_in
    if !signed_in?
      current_user = @identity.user
      token = JwtHelper.encode(current_user.informations)
      response_jwt_cookie(token)
    end
  end

  def sign_out!
    if signed_in?
      current_user = User.guest
      delete_jwt_cookie!
    end
  end

  def set_identity(identity)
    @identity = identity
  end

  def response_jwt_cookie(value, expires = 1.day.from_now)
    response.set_cookie('JWT-TOKEN', {
      value: value,
      httponly: true,
      expires: expires,
      path: '/'
    })
  end

  def delete_jwt_cookie!()
    @current_jwt = nil
    response_jwt_cookie("", 0.seconds.from_now)
  end
end