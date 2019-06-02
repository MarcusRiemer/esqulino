

class AuthController < ApplicationController
  before_action :authenticate_user!

  def callback
    create_identity
    sign_in
    redirect_to "/"
  end

  def register
    auth = {
      provider: "identity",
      uid: params[:email],
      info: {
        name: params[:user_name]
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

  def email_confirmation
    identity = Identity.where("data ->> 'verify_token' = ?", params[:verify_token]).first!
    # identity found and not confirmed
    if identity && !identity[:data][:confirmed]
      identity[:data][:confirmed] = true;
      identity.save

      @identity = identity
      sign_in
      redirect_to "/"
    else
      # TODO ERROR MSG: Does not found an e-mail with this token
    end
  end

  def destroy
    sign_out!
    delete_jwt_cookie!
    render json: { loggged_in: false }
      .transform_keys { |k| k.to_s.camelize(:lower) }, status: :ok
  end
end

