

class IdentitiesController < ApplicationController
  before_action :authenticate_user!

  def change_password_params
    params
        .permit([:currentPassword, :newPassword])
        .transform_keys { |k| k.underscore }
  end


  def reset_password_params
    params
        .permit([:email, :password, :confirmedPassword, :token])
        .transform_keys { |k| k.underscore }
  end

  def reset_password_mail_params
    params
        .permit([:email])
  end

  def email_confirmation_params
    params
        .permit([:verify_token])
  end

  def search_for_identity(permited_params)
    return Identity.search({
      provider: "identity",
      uid: permited_params[:email]
    })
  end


  def show
    if signed_in?
      # TODO return every provider for a specific user
    end
  end

  def reset_password
    permited_params = reset_password_params
    identity = search_for_identity(permited_params)

    if identity
      if identity.reset_token_eql?(permited_params[:token])
        if !identity.reset_token_expired?
          identity.set_reset_token_expired
          identity.set_password(permited_params[:password])
          render_user_description({ loggged_in: false })
        else
          render json: { error: "token expired" }, status: :unauthorized
        end
      else
        render json: { error: "token not valid" }, status: :unauthorized
      end
    else 
      render json: { error: "e-mail not found"}, status: :unauthorized
    end
  end

  def reset_password_mail
    identity = search_for_identity(reset_password_mail_params)
    if identity
      identity.set_reset_token
      IdentityMailer.reset_password(identity, request_locale).deliver
    else 
      render json: { error: "e-mail not found"}, status: :unauthorized
    end#
  end


  def email_confirmation
    identity = Identity.where("data ->> 'verify_token' = ?", email_confirmation_params[:verify_token]).first
    # identity found and not confirmed
    if identity && !identity.confirmed?
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
      identity = Identity.search_with_user_id(@current_user[:id])
                          .where("provider = 'identity'")
                          .first

      if (identity)
        permited_params = change_password_params
        if !identity.password_eql?(permited_params[:new_password])
          if identity.password_eql?(permited_params[:current_password])
            identity.set_password_all_with_user_id(permited_params[:new_password])
            IdentityMailer.changed_password(identity, @current_user.display_name).deliver
            render_user_description({ loggged_in: true })
          end
        end
      else
        render json: { error: "no vailable identity found"}, status: :unauthorized
      end
    end
  end
end

