

class SessionsController < ApplicationController
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

      response.set_cookie('XSRF-TOKEN', {
        value: token, 
        httponly: true, 
        expires: 1.day.from_now
      })
    end

    render json: { role: 'user' }, status: :ok
  end

  def destroy
    @current_user = nil
    response.delete_cookie('XSRF-TOKEN')
    render json: { message: 'signed out' }, status: :ok
  end
end

