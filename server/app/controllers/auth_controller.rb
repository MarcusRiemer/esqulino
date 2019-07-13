class AuthController < ApplicationController
  include AuthHelper
  include UserHelper

  def register_params
    params
        .permit([:email, :username, :password])
  end

  def login_params
    params
        .permit([:email, :password])
  end

  # This function is essential for omniauth.
  # If youre authenticated by the external provider, you will be 
  # navigated to this function.
  def callback
    begin
      identity = get_or_create_identity()
      sign_in(identity)
      redirect_to "/"
    rescue => e
      return error_response(e.message)
    end
  end
  
  def login_with_password
    identity = PasswordIdentity.find_by(uid: login_params[:email])
    if (not identity)
      return error_response("E-Mail not found")
    end

    if (not identity.confirmed?)
      return error_response("Please confirm your e-mail")
    end

    if (not identity.password_eql?(params[:password]))
      return error_response("Wrong password")
    end

    sign_in(identity)
    api_response(user_information)
  end

  # This register function is only for the identity provider.
  # You use this for creating an identity with a password
  # with simulated callback data
  def register
    identity_data = create_identity_data(register_params)

    begin
      identity = get_or_create_identity(email = true)
      api_response(current_user.informations)
    rescue Exception => e
      redirect_to "/"
    end
  end

  def destroy
    sign_out!
    delete_jwt_cookie!
    api_response(current_user.informations)
  end

  def failure
    redirect_to "/"
  end

  private 

  def get_or_create_identity(email = false)
    auth_hash = request.env["omniauth.auth"] || create_identity_data(register_params)
    identity = Identity.search(auth_hash)
    if (not identity)
      user = signed_in?() ? current_user : User.create_from_hash(auth_hash)
      identity = Identity.create_with_auth(auth_hash, user, email)
    end
  end
end

