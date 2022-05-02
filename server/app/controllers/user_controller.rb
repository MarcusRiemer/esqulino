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

    redirect_to "#{site}/auth/realms/#{realm}/account/", allow_other_host: true
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
