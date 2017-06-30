module ProjectsHelper
  include ActionController::HttpAuthentication::Basic 
  
  # Loads the currently requested project
  def current_project
    if @current_project.nil? then
      projects_dir = Rails.application.config.sqlino[:projects_dir]
      @current_project = Project.new File.join(projects_dir, params['project_id']), false

      if self.has_basic_credentials? request
        user, pass = self.user_name_and_password request
        @current_project.write_access = @current_project.verify_password user, pass
      end
    end

    @current_project
  end

  # Calls the given block if the current project is available
  # with write acess. Asks for write access otherwise
  def ensure_write_access (&proc)
    if not current_project.write_access
      # Ask the user for a password
      auth_realm = Rails.configuration.sqlino['name']
      self.request_http_basic_authentication auth_realm
    else
      proc.call
    end
  end
end
