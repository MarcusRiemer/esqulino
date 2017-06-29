module ProjectsHelper
  # Loads the currently requested project
  def current_project
    if @current_project.nil? then
      projects_dir = Rails.application.config.sqlino[:projects_dir]
      @current_project = Project.new File.join(projects_dir, params['project_id']), false
    end

    @current_project
  end
end
