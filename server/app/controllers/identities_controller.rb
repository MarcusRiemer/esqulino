

class IdentitiesController < ApplicationController
  before_action :authenticate_user!

  def show
    if signed_in?
      # TODO return every provider for a specific user
    end
  end

  def change_password_params
    params
        .permit([:currentPassword, :newPassword])
        .transform_keys { |k| k.underscore }
  end

  def reset_password_accepted

  end

  def reset_password_mail
    search_for =  {
      provider: "identity",
      uid: params[:email]
    }

    identity = Identity.search(search_for)
    if (identity)
      IdentityMailer.reset_password(identity, request_locale).deliver
    else 
      render json: { error: "e-mail not found"}, status: :unauthorized
    end
  end


  def email_confirmation
    identity = Identity.where("data ->> 'verify_token' = ?", params[:verify_token]).first!
    # identity found and not confirmed
    if identity && !identity[:data][:confirmed]
      identity[:data][:confirmed] = true;
      identity.save

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
            identity[:data]["password"] = params[:new_password]
            identity.save
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

