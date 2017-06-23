require_dependency 'project'

class ProjectsController < ApplicationController
  include ProjectsHelper
  
  # Enumerating all available projects
  def index
    projects = enumerate_projects(Rails.application.config.sqlino[:projects_dir], false, true)
                 .map { |project| project.public_description }
    
    render json: projects
  end

  # Retrieving a single project
  def show
    render json: JSON.generate(current_project)
  end

  # The preview image for a specific project
  def preview_image
    send_file current_project.preview_image_path, disposition: 'inline'
  end
end
