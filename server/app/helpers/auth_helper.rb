require 'bcrypt'

module AuthHelper
  include BCrypt

  def create_auth(permited_params)
    # If the user is already logged in, 
    # choose the current username and password

    if signed_in?
      # Check if there exists an PasswordIdentity
      # because of a logged in user with an extern provider
      identity = PasswordIdentity.intern_provider(@current_user[:id]).first
      if identity
        name = @current_user[:display_name]
        password = identity[:data]["password"]
      end
    end
    return auth = {
      provider: "identity",
      uid: permited_params[:email],
      info: {
        name: (name || permited_params[:username]) 
      },
      data: {
        password: (password || BCrypt::Password.create(permited_params[:password])),
        verify_token: SecureRandom.uuid,
        confirmed: false
      }
    }
  end

  def sign_in
    if !signed_in?
      @current_user = @identity.user
      token = Auth.encode({
        user_id: @identity.user_id,
        data: @identity[:data],
        display_name: @current_user.display_name
      })
      response_jwt_cookie(token)
    end
  end

  def sign_out!
    if signed_in?
      @current_user = nil
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
    response_jwt_cookie("", 0.seconds.from_now)
  end
end