class UserController < ApplicationController
  include UserHelper
  include LocaleHelper

  # Responds with current user information. This is the same information that is
  # encoded in the ACCESS_TOKEN Cookie as JWT. But as that cookie is set to
  # "HttpOnly" (which should stop malicious JS clients that are hopefully never
  # injected) we need a way to access the JWT payload.
  def index
    api_response(user_information)
  end

  # Redirects the user to whatever URL is configured for the keycloak-server
  def keycloak_settings
    config = Rails.application.config_for :sqlino
    site = config[:auth_provider_keys][:keycloak_site]
    realm = config[:auth_provider_keys][:keycloak_realm]

    redirect_to "#{site}/auth/realms/#{realm}/account/"
  end

  # The function is used to determine the authorization of a ui element
  def may_perform
    to_response = []
    permited_params = may_perform_params


    permited_params[:list].each do |k|
      resource_type = k[:resource_type].to_s
      resource_id = k[:resource_id].to_s
      policy_action = k[:policy_action].to_s + "?"
      resource = nil

      if (not resource_id.eql? "") then
        resource = resource_type.constantize.find_by(id: resource_id)
      end

      # TODO mri: Heavens! How could this get past my code review?!
      # Calling `new` on a string provided by the user (even if suffixed) is a
      # very big no-No-NO!
      policy = "#{resource_type}Policy".constantize.new(current_user, resource)
      to_response << { "perform" => policy.send(policy_action) }
    end

    api_array_response(to_response)
  end

  private

  def may_perform_params
    permited = params.permit([:list => [:resourceId, :resourceType, :policyAction]])
    permited[:list].map { |e| e.transform_keys! { |k| k.underscore } }
    return permited
  end

  def api_array_response(to_response)
    render json: to_response.map { |k| k.transform_keys! { |v| v.to_s.camelize(:lower) } }, status: :ok
  end
end
