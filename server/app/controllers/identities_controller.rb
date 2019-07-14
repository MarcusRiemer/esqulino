

class IdentitiesController < ApplicationController
  include UserHelper
  include LocaleHelper
  
  def show
    if signed_in?
      api_response(current_user.all_providers)
    end
  end

  def list
    api_array_response(Identity.all_client_informations)
  end

  def reset_password
    permited_params = reset_password_params
    identity = PasswordIdentity.find_by_password_reset_token(permited_params[:token])
                               .first

    if identity
      if !identity.reset_token_expired?
        identity.set_reset_token_expired
        identity.save!

        identity.set_password_all_with_user_id(permited_params[:password])
        api_response(user_information)
      else
        error_response("token expired")
      end
    else 
      error_response("token not valid")
    end
  end

  def reset_password_mail
    identity = PasswordIdentity.find_by(uid: email_permit_param[:email])
    if (identity) then
      identity.set_reset_token
      identity.save!
      IdentityMailer.reset_password(identity, request_locale).deliver
    else
      error_response("e-mail not found")
    end
  end

  def send_verify_email
    identity = PasswordIdentity.find_by(uid: email_permit_param[:email])
    if (not identity) then
      return error_response("e-mail not found")
    end

    if identity.confirmed?
      return error_response("e-mail already confirmed")
    end

    if (not identity.can_send_verify_mail?)
      return error_response("You need to wait for #{identity.waiting_time} minutes")
    end

    identity.set_waiting_time()
    identity.save!
    IdentityMailer.confirm_email(identity, request_locale).deliver
    api_response(user_information)
  end


  def email_confirmation
    permited_params = email_confirmation_params
    identity = PasswordIdentity.find_by_verify_token(permited_params[:verify_token])
                               .first

    # identity found and not confirmed
    if identity && (not identity.confirmed?) then
      identity = identity.email_confirmation
      sign_in(identity)
      redirect_to "/"
    else
      error_response("No valid e-email found.")
    end
  end

  def change_password
    if signed_in?
      identity = PasswordIdentity.find_by(user_id: current_user[:id], provider: 'identity')
      if (not identity) then
        permited_params = change_password_params
        identity.change_password(permited_params)
      else
        error_response("no vailable identity found")
      end
    end
  end

  def destroy
    if signed_in?
      permited_params = delete_identity_params
      identity = Identity.where(id: permited_params[:id]).first

      if (not identity) then
        return error_response("There exist no identity with this email.")
      end
      all_identities = current_user.all_validated_emails

      # You need more than one identity to be able
      # to delete an identity
      if (all_identities.count <= 1 && identity.confirmed?) then
        return error_response("You need more than one confirmed e-mail.")
      end
  
      # If the email to be deleted is the current primary email and 
      # no more identities with the same email existing return.
      if (current_user.email.eql? identity.email) and (all_identities.count <= 1) then
        return error_response("You can't delete the primary e-mail.")
      end
     
      # Checks if the identity to be deleted has the same
      # user_id as the logged in user
      if (not identity.user_id.eql? current_user.id) then
        return error_response("You have not the permission to delete this identity.")
      end

      identity.delete
      api_response(current_user.all_providers)
    end
  end

  private

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

  def email_permit_param
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

  def api_array_response(to_response)
    render json: to_response.map { |k| k.transform_keys! { |v| v.to_s.camelize(:lower) }}, status: :ok
  end
end