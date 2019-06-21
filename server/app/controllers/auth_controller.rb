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

  def callback
    create_identity
    sign_in

    redirect_to "/"
  end

  def login_with_password
    identity = search_for_password_identity(login_params)
    if identity
      if identity.confirmed?
        if identity.password_eql?(params[:password])
          set_identity(identity)
          sign_in
          api_response(user_information)
        else
          render json: { error: "Wrong password" }, status: :unauthorized
        end
      else
        render json:  { error: "Please confirm your e-mail" }, status: :unauthorized
      end
    else
      render json: { error: "E-Mail not found" }, status: :unauthorized
    end
  end

  def register
    permited_params = register_params
    identity_data = create_identity_data(permited_params)

    create_identity(identity_data, true)
    api_response({ loggged_in: false })
  end

  def destroy
    sign_out!
    delete_jwt_cookie!
    api_response({ loggged_in: false })
  end
end

