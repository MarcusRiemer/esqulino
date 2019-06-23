class UserController < ApplicationController
  include UserHelper

  before_action :authenticate_user!

  def change_email_params
    params
      .permit([:primaryEmail])
        .transform_keys { |k| k.underscore }
  end

  def change_username_params
    params
      .permit([:displayName])
        .transform_keys { |k| k.underscore }
  end

  def index
    api_response(user_information)
  end

  def change_username
    if signed_in?
      permited_params = change_username_params
      @current_user.display_name = permited_params[:display_name]
      if @current_user.valid?
        @current_user.save!
        api_response(user_information)
      else
        render json: {error: "This username is not valid" }, status: :unauthorized
      end 
    end
  end

  def change_primary_email
    token = params[:token]
    if token
      identity = Identity.where("data ->> 'change_primary_token' = ?", token)
                         .first
      if identity 
        user = User.find_by(id: identity[:user_id])
        if user
          if identity.primary_email_token_eql?(token)
            if !identity.primary_email_token_expired?
              user.email = identity[:data]["email"]
              identity.set_primary_email_token_expired
              if user.valid?
                user.save!
                redirect_to "/"
              else
                render json: {error: "This e-mail is already linked with a user"}, status: :unauthorized
              end
            else
              render json: {error: "Token expired"}, status: :unauthorized
            end
          else
            render json: {error: "No user found"}, status: :unauthorized
          end
        else
          render json: {error: "Invalid token"}, status: :unauthorized
        end
      else
        render json: {error: "No identity found"}, status: :unauthorized
      end
    else
      render json: {error: "Invalid token"}, status: :unauthorized
    end
  end

  def send_change_email
    if signed_in?
      permited_params = change_email_params
      if !@current_user.email.eql? permited_params[:primary_email]
        identity = Identity.where("user_id = ? and data ->> 'email' = ?", @current_user.id, permited_params[:primary_email])
                           .first
        if identity
          if identity.confirmed?
            identity.set_primary_email_token
            UserMailer.change_primary_email(identity, request_locale).deliver
            api_response(user_information)
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
