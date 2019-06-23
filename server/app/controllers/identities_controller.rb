

class IdentitiesController < ApplicationController
  include AuthHelper
  include IdentityHelper
  include UserHelper
  include LocaleHelper

  before_action :authenticate_user!

  def change_password_params
    params
        .permit([:currentPassword, :newPassword])
        .transform_keys { |k| k.underscore }
  end


  def reset_password_params
    params
        .permit([:password, :confirmedPassword, :token])
        .transform_keys { |k| k.underscore }
  end

  def mail_permit_param
    params
        .permit([:email])
  end

  def email_confirmation_params
    params
        .permit([:verify_token])
  end

  def delete_identity_params
    params
  end
  
  def show
    if signed_in?
      api_response(@current_user.all_providers)
    end
  end

  def reset_password
    permited_params = reset_password_params
    identity = PasswordIdentity.where("data ->> 'password_reset_token' = ? ", permited_params[:token])
                       .first

    if identity
      if !identity.reset_token_expired?
        identity.set_reset_token_expired
        identity.set_password_all_with_user_id(permited_params[:password])
        api_response(user_information)
      else
        render json: { error: "token expired" }, status: :unauthorized
      end
    else 
      render json: { error: "token not valid"}, status: :unauthorized
    end
  end

  def reset_password_mail
    identity = search_for_password_identity(mail_permit_param)
    if identity
      identity.set_reset_token
      IdentityMailer.reset_password(identity, request_locale).deliver
    else 
      render json: { error: "e-mail not found"}, status: :unauthorized
    end
  end

  def send_verify_email
    identity = search_for_password_identity(mail_permit_param)
    if identity
      if !identity.confirmed?       
        if identity.can_send_verify_mail?
          identity.set_waiting_time()
          IdentityMailer.confirm_email(identity, request_locale).deliver
          api_response(user_information)
        else
          render json: { error: "You need to wait for #{identity.waiting_time} minutes"  }, status: :unauthorized
        end
      else
        render json: { error: "e-mail already confirmed"}, status: :unauthorized
      end
    else 
      render json: { error: "e-mail not found"}, status: :unauthorized
    end
  end


  def email_confirmation
    identity = PasswordIdentity.where("data ->> 'verify_token' = ?", email_confirmation_params[:verify_token]).first
    # identity found and not confirmed
    if identity && !identity.confirmed?
      user = User.find_by(id: identity[:user_id])
      if !user.email?
        # Sets the primary email on confirmation
        user.set_email(identity[:data]["email"])
      end
      identity.confirmed!
      set_identity(identity)
      sign_in
      redirect_to "/"
    else
      render json: { error: "Doesnt found an e-mail for your token" }, status: :unauthorized
    end
  end

  def change_password
    if signed_in?
      identity = PasswordIdentity.find_by(user_id: @current_user[:id], provider: 'identity')
      if (identity)
        permited_params = change_password_params
        if !identity.password_eql?(permited_params[:new_password])
          if identity.password_eql?(permited_params[:current_password])
            identity.set_password_all_with_user_id(permited_params[:new_password])
            IdentityMailer.changed_password(identity).deliver
            api_response(user_information)
          else
            render json: { error: "current password is wrong"}, status: :unauthorized
          end
        end
      else
        render json: { error: "no vailable identity found"}, status: :unauthorized
      end
    end
  end

  def destroy
    if signed_in?
      permited_params = delete_identity_params
      identity = Identity.where(id: permited_params[:id]).first
      if (identity)
        all_identities = Identity.where(user_id: @current_user[:id])
        if (all_identities.count > 1)
          # Is the identity not the current primary mail or is it the current primary email
          # and has more identities with the same email
          if (!@current_user.email.eql? identity[:data]["email"]) || (@current_user.email.eql? identity[:data]["email"]) && (all_identities.where("data ->> 'email' = ?", identity[:data]["email"]).count > 1)
            if identity.user_id.eql? @current_user.id
              identity.delete
              api_response(@current_user.all_providers)
            else
              render json: { error: "you can't delete this identity" }, status: :unauthorized
            end
          else 
            render json: { error: "you can't delete the primary e-mail" }, status: :unauthorized
          end
        else
          render json: { error: "you need more than one e-email" }, status: :unauthorized
        end
      else 
        render json: { error: "there is none identity with this email"}, status: :unauthorized
      end
    end
  end
end

