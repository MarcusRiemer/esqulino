require_dependency 'project'

class ProjectsController < ApplicationController
  include ProjectsHelper
  include JsonSchemaHelper

  # Enumerating all available projects
  def index
    @projects = ProjectStructure.all
    # projects = enumerate_projects(projects_dir, false, true)
    #              .map { |project| project.public_description }

    render json: @projects
  end

  # Creating a new project
  def create
    # Grab parameters to create the project
    updated_project = ensure_request("ProjectCreationDescription", request.body.read)
    creation_params = ProjectCreationParams.new updated_project

    # Actually create the project
    create_project projects_dir, creation_params

    # Tell people that are interested about this
    email = ProjectMailer.created_admin(creation_params.id, creation_params.name)
    email.deliver_later

    render :json => { 'id' => creation_params.id }, :status => 200
  end

  # Retrieving a single project
  # TODO construct sqlite path with project slug and pass it to here: database_describe_schema(sqlite_file_path)
  # TODO Load current proejct and merger schema there.
  def show
    project = ProjectStructure.find(params[:project_id])

    to_return = project.serializable_hash
    to_return['schema'] = []
    to_return['apiVersion'] = 4
    to_return['queries'] = []
    to_return['pages'] = []

    render json: to_return
  end

  # Update an existing project
  def edit
    ensure_write_access do
      updated_project = ensure_request("ProjectUpdateDescription", request.body.read)

      current_project.update_description! updated_project
      current_project.save_description

      render :status => 200
    end
  end

  def destroy
    ensure_write_access do
      current_project.delete!
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
