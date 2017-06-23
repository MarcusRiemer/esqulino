module ProjectsHelper
  # Loads the currently requested project
  def current_project
    projects_dir = Rails.application.config.sqlino[:projects_dir]
    
    Project.new File.join(projects_dir, params['project_id']), false
  end
end
