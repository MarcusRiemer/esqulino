# frozen_string_literal: true

# Allows access to projects and its resources in controllers
module ProjectsHelper
  include ActionController::HttpAuthentication::Basic

  # Access to the current project
  def current_project
    @current_project ||= Project.find_by_slug_or_id!(params['project_id'])
  end

  # Calls the given block if the current project is available
  # with write acess. Asks for write access otherwise
  def ensure_write_access(&proc)
    success = false

    # Was a password provided?
    if has_basic_credentials? request
      user, pass = user_name_and_password request

      # Does it allow access?
      if current_project.verify_write_access user, pass
        proc.call
        success = true
      end
    end

    unless success
      # Ask the user for a password
      auth_realm = Rails.configuration.sqlino['name']
      request_http_basic_authentication auth_realm
    end

    success
  end
end
