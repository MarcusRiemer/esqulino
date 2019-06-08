

class AuthController < ApplicationController
  before_action :authenticate_user!

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
      if identity[:data]["confirmed"]
        if identity[:data]["password"].eql? params[:password]
          set_identity(identity)
          sign_in
          render json: { loggged_in: true }
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
    auth = {
      provider: "identity",
      uid: params[:email],
      info: {
        name: params[:username]
      },
      data: {
        email: params[:email],
        password: params[:password],
        verify_token: SecureRandom.uuid,
        confirmed: false
      }
    }

    create_identity(auth, true)
    render json: { loggged_in: false }
  end


  def destroy
    sign_out!
    delete_jwt_cookie!
    render json: { loggged_in: false }
      .transform_keys { |k| k.to_s.camelize(:lower) }, status: :ok
  end
end

