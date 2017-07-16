require_dependency 'project'

class ProjectsController < ApplicationController
  include ProjectsHelper
  include ValidationHelper

  # Enumerating all available projects
  def index
    projects = enumerate_projects(projects_dir, false, true)
                 .map { |project| project.public_description }

    render json: projects
  end

  def create
    updated_project = ensure_request("ProjectCreationDescription", request.body.read)

    creation_params = ProjectCreationParams.new updated_project

    create_project projects_dir, creation_params
    render :json => { 'id' => creation_params.id }, :status => 200
  end

  # Retrieving a single project
  def show
    render json: JSON.generate(current_project)
  end

  # Update an existing project
  def edit
    ensure_write_access do
      updated_project = ensure_request("ProjectDescription", request.body.read)

      current_project.update_description! updated_project
      current_project.save_description

      render :status => 200
    end
  end

  # The preview image for a specific project
  def preview_image
    if current_project.preview_image_exists? then
      send_file current_project.preview_image_path, disposition: 'inline'
    else
      render plain: "Project has no preview image", status: :not_found
    end
  end
end
