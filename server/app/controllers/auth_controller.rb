
require 'bcrypt'

class AuthController < ApplicationController
  include BCrypt
  before_action :authenticate_user!

  def register_params
    params
        .permit([:email, :username, :password])
  end

  def callback
    create_identity
    sign_in

    redirect_to "/"
  end

  def login_with_password
    auth = {
      provider: "identity",
      uid: params[:email]
    }
    identity = Identity.search(auth)
    if identity
      if identity.confirmed?
        if identity.password_eql?(params[:password])
          set_identity(identity)
          sign_in
          render_user_description({ loggged_in: true })
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
    auth = {
      provider: "identity",
      uid: permited_params[:email],
      info: {
        name: permited_params[:username]
      },
      data: {
        email: permited_params[:email],
        password: Password.create(permited_params[:password]),
        verify_token: SecureRandom.uuid,
        confirmed: false
      }
    }

    create_identity(auth, true)
    render_user_description({ loggged_in: false })
  end

  def destroy
    sign_out!
    delete_jwt_cookie!
    render_user_description({ loggged_in: false })
  end
end

