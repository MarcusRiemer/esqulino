class IdentitiesController < ApplicationController
  include UserHelper
  include LocaleHelper

  # Responds with all linked identities
  def show
    ensure_is_logged_in do
      api_response(current_user.all_providers)
    end
  end

  # Responds with all available providers
  def list
    api_array_response(Identity::Identity.all_client_information)
  end

  def api_array_response(to_response)
    render json: to_response.map { |k| k.transform_keys! { |v| v.to_s.camelize(:lower) } }, status: :ok
  end
end
