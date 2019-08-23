class UserController < ApplicationController
  include UserHelper
  include LocaleHelper

  def index
    api_response(user_information)
  end

  def change_username
    if signed_in? then
      permited_params = change_username_params
      current_user.display_name = permited_params[:display_name]
      if current_user.valid?
        current_user.save!
        api_response(user_information)
      else
        error_response("This username is not valid")
      end 
    end
  end

  def change_primary_email
    token = params[:token]
    if (not token) then
      return error_response("Invalid token")
    end

    identity = Identity.find_by_change_primary_email_token(token)
                       .first

    if (not identity) then
      return error_response("No user was found")
    end
    user = identity.user

    if (not user) then
      return error_response("No user was found")
    end

    if (not identity.primary_email_token_eql?(token)) then
      return error_response("Invalid token")
    end

    if (identity.primary_email_token_expired?) then
      return error_response("Token expired")
    end

    user.email = identity.email
    identity.set_primary_email_token_expired
    identity.save!

    if user.invalid?
      return error_response("This e-mail is already linked with a user")
    end

    user.save!
    redirect_to "/"
  end

  # Sends e-mail to primary mail 
  # Change of primary needs to be confirmed 
  def send_change_email
    if (not signed_in?) then
      return error_response("You need to be logged in")
    end

    permited_params = change_email_params
    if current_user.email.eql? permited_params[:primary_email] then
      return render status: :ok
    end

    if current_user.primary_email_change? then
      return error_response("You are already changing the primary email")
    end

    validated_identities = current_user.all_validated_emails

    identity = Identity.where(user_id: current_user.id)
                       .find_by_email(permited_params[:primary_email])
                       .first

    if (not identity) then
      return error_response("Your account has no linked email with this name")
    end

    if (not identity.confirmed?) then
      return error_response("You need to confirm your e-mail adress")
    end

    identity.set_primary_email_token
    identity.save!

    UserMailer.change_primary_email(identity, request_locale).deliver
    api_response(user_information)
  end

  def may_perform
    to_response = []
    permited_params = may_perform_params
    begin
      permited_params[:list].each do |k|
        resource_type = k[:resource_type].to_s
        resource_id = k[:resource_id].to_s
        policy_action = k[:policy_action].to_s + "?"
  
        if (not resource_id.eql? "") then
          resource = resource_type.constantize.find_by(id: resource_id)
        end
        policy = "#{resource_type}Policy".constantize.new(current_user, resource)
        to_response << {"perform" => policy.send(policy_action)}
      end
      api_array_response(to_response)
    rescue => exception
      error_response("Something went wrong")
    end
  end


  private

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

  def may_perform_params
    permited = params.permit([:list => [:resourceId, :resourceType, :policyAction]])
    permited[:list].map { |e| e.transform_keys! { |k| k.underscore } }
    return permited
  end

  def api_array_response(to_response)
    render json: to_response.map { |k| k.transform_keys! { |v| v.to_s.camelize(:lower) }}, status: :ok
  end
end
