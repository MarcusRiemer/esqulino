class UserController < ApplicationController
  before_action :authenticate_user!

  def change_email_params
    params
      .permit([:primaryEmail])
      .transform_keys { |k| k.underscore }
  end

  def index
    if signed_in?
      to_return = {
        display_name: @current_user.display_name,
        logged_in: true
      }
    else
      to_return = { logged_in: false }
    end

    api_response(to_return)
  end

  def change_email
    if signed_in?
      permited_params = change_email_params
      if !@current_user.email.eql? permited_params[:primary_email]
        identity = PasswordIdentity.find_by(user_id: @current_user.id, uid: permited_params[:primary_email])

        if identity
          if identity.confirmed?
            @current_user.email = permited_params[:primary_email]
            if @current_user.valid?
              @current_user.save!
              api_response(@current_user.all_providers)
            else
              render json: {error: "This e-mail is already linked with a user"}, status: :unauthorized
            end
          else 
            render json: {error: "You need to confirm your e-mail adress"}, status: :unauthorized
          end
        else
          render json: {error: "Your account has no linked email with this name"}, status: :unauthorized
        end
      else
        render status: :ok
      end
    else
      render status: :unauthorized
    end
  end
end
