# Allows access to projects and its resources in controllers
module ProjectsHelper
  include ActionController::HttpAuthentication::Basic 
  
  # Loads the currently requested project
  def current_project(project_id = nil)
    project_id = project_id || params['project_id']
    
    if @current_project.nil? then
      projects_dir = Rails.application.config.sqlino[:projects_dir]
      @current_project = Project.new File.join(projects_dir, project_id), false

      if self.has_basic_credentials? request
        user, pass = self.user_name_and_password request
        @current_project.write_access = @current_project.verify_password user, pass
      end
    end

    @current_project
  end

  # Loads the currently requested query of the currently requested project
  def current_query
    if @current_query.nil? then
      @current_query = Query.new(current_project, params['query_id'])
    end

    @current_query
  end

  # Loads the currently requested page of the currently requested project
  def current_page(page_name_or_id = nil, index_valid = false)
    page_name_or_id = page_name_or_id || params['page_id']
    
    if @current_page.nil? then
      # Distinguish between index page, page names and ids
      if page_name_or_id.nil? || page_name_or_id.empty? then
        # Is there a matching index page and should we use it?
        if index_valid and self.current_project.index_page? then
          # Yes, we use that
          @current_page = self.current_project.index_page
        else
          # No, we use an empty page
          @current_page = Page.new(self.current_project);
        end
      elsif is_string_id? page_name_or_id then
        # Specific ID, this could be a page that does not exist yet
        @current_page = Page.new(self.current_project, page_name_or_id)
      else
        # User-facing name, this needs to be unescaped to turn
        # things like %20 back into spaces
        page_name = URI.unescape(page_name_or_id)
        @current_page = self.current_project.page_by_name page_name_or_id
      end
    end

    @current_page
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
