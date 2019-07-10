class AuthController < ApplicationController
  include AuthHelper
  include UserHelper
  include IdentityHelper

  before_action :authenticate_user!

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
      create_identity
      sign_in
  
      redirect_to "/"
    rescue => e
      return error_response(e.message)
    end
  end
  
  def login_with_password
    identity = search_for_password_identity(login_params)
    if (not identity)
      return error_response("E-Mail not found")
    end

    if (not identity.confirmed?)
      return error_response("Please confirm your e-mail")
    end

    if (not identity.password_eql?(params[:password]))
      return error_response("Wrong password")
    end

    set_identity(identity)
    sign_in
    api_response(user_information)
  end

  # This register function is only for the identity provider.
  # You use this for creating an identity with a password
  # with simulated callback data
  def register
    permited_params = register_params
    identity_data = create_identity_data(permited_params)

    begin
      create_identity(identity_data, true)
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
end

