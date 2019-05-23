

class SessionsController < ApplicationController
  def create
    user = User.from_omniauth(request.env["omniauth.auth"])
    token = JWT.encode({user_id: 10}, 'HS256')
    response.set_cookie('jwt', {value: token, httponly: true})

    render json: { role: 'user' }, status: :ok
  end

  def destroy
    redirect_to root_url
  end

  def failure
    redirect_to root_url
  end
end

