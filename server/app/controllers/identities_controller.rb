

class IdentitiesController < ApplicationController
  before_action :authenticate_user!

  def change_password_params
    params
        .permit([:currentPassword, :newPassword])
        .transform_keys { |k| k.underscore }
  end

  def delete_identity!(identity)
    Identity.delete(identity[:id])
  end

  def set_password(identity, password)
    identity[:data]["password"] = password
    identity.save
  end

  def set_token_expired(identity)
    identity[:data]["password_reset_token_exp"] = Time.now - 1.hour
    identity.save
  end

  def set_confirmed(identity)
    identity[:data][:confirmed] = true;
    identity.save
  end

  def search_for_identity(uid = params[:email])
    return Identity.search({
      provider: "identity",
      uid: uid
    })
  end

  def set_reset_token(identity)
    identity[:data]["password_reset_token"] = SecureRandom.uuid
    identity[:data]["password_reset_token_exp"] = Time.now + 30.minutes
    identity.save
  end

  def show
    if signed_in?
      # TODO return every provider for a specific user
    end
  end

  def reset_password
    identity = search_for_identity
    if identity
      if params[:token].eql? identity[:data]["password_reset_token"]
        if Time.now <= identity[:data]["password_reset_token_exp"]
          set_token_expired(identity)
          set_password(identity, params[:password])
          render json: { logged_in: false }
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
    identity = search_for_identity
    if identity
      set_reset_token(identity)
      IdentityMailer.reset_password(identity, request_locale).deliver
    else 
      render json: { error: "e-mail not found"}, status: :unauthorized
    end
  end


  def email_confirmation
    identity = Identity.where("data ->> 'verify_token' = ?", params[:verify_token]).first!
    # identity found and not confirmed
    if identity && !identity[:data][:confirmed]
      set_confirmed(identity)
      set_identity(identity)
      sign_in
      redirect_to "/"
      render json: { loggged_in: true }
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
        params = change_password_params
        if !identity[:data]["password"].eql? params[:new_password]
          if identity[:data]["password"].eql? params[:current_password]
            set_password(identity, params[:new_password])
            IdentityMailer.changed_password(identity, User.display_name(@current_user[:id])).deliver
            render json: { logged_in: true }
          end
        end
      else
        render json: { error: "no vailable identity found"}
      end
    end
  end
end

