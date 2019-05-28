

class AuthController < ApplicationController
  before_action :authenticate_user!

  def create
    auth = request.env["omniauth.auth"]
    @identity = Identity.search(auth)
    if !@identity
      @identity = Identity.create_with_auth(auth, current_user)
    end

    if !signed_in?
      @current_user = @identity.user
      token = Auth.encode({user_id: @identity.user_id})
      response_jwt_cookie(token)
    end

    redirect_to "/"
  end

  def failure
    render json: { error: "something got wrong" }, status: :bad_request
  end

  def destroy
    sign_out!
    delete_jwt_cookie!
    render json: { loggged_in: false }
      .transform_keys { |k| k.to_s.camelize(:lower) }, status: :ok
  end
end

