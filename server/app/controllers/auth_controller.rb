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
  # If youre authenticated and got the callback data
  # you will be navigated to this controller function. 
  # In this function you create an identity with the callback data,
  # sign in and redirect to base url.
  def callback
    begin
      create_identity
      sign_in
  
      redirect_to "/"
    rescue => e
      render json: { "error": e.message }
    end
  end
  
  def login_with_password
    identity = search_for_password_identity(login_params)
    if (not identity)
      render json: { error: "E-Mail not found" }, status: :unauthorized
      return
    end

    if (not identity.confirmed?)
      render json:  { error: "Please confirm your e-mail" }, status: :unauthorized
      return
    end

    if (not identity.password_eql?(params[:password]))
      render json: { error: "Wrong password" }, status: :unauthorized
      return
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
      api_response({ loggged_in: false })
    rescue Exception => e
      redirect_to "/"
    end
  end

  def destroy
    sign_out!
    delete_jwt_cookie!
    api_response({ loggged_in: false })
  end

  def failure
    redirect_to "/"
  end
end

