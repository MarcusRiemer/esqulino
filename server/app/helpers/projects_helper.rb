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
    if self.has_basic_credentials? request
      user, pass = self.user_name_and_password request

      # Does it allow access?
      if current_project.verify_write_access user, pass
        proc.call
        success = true
      end
    end

    if not success
      # Ask the user for a password
      auth_realm = Rails.configuration.sqlino['name']
      self.request_http_basic_authentication auth_realm
    end

    return success
  end
end
