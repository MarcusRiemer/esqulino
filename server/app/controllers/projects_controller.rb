require_dependency 'legacy_project'

class ProjectsController < ApplicationController
  include ProjectsHelper
  include JsonSchemaHelper

  # Lists all projects
  def index
    render json: Project.all
  end

  # Apart from creating the database object this action also needs to
  # set up the directory layout for project assets that are stored
  # on the disk.
  def create
    # Creating the database object
    project = Project.new
    project.assign_attributes(project_creation_params)

    # If that worked ...
    if project.save
      # ... create the directoy layout
      Builders::ProjectUtility.new(id: project.id, db_type: 'sqlite3').generate!
      render json: { 'id' => project.slug }, :status => 200
    else
      # ... otherwise tell the user where he went wrong
      render :json => { 'errors' => project.errors }, :status => 400
    end
  end

  # Retrieves all information about a single project. This is the only
  # request the client will make to retrieve the *whole* project with
  # *everything* that is required to render it properly.
  def show
    project = Project.full.find_by(slug: params[:project_id])
    render json: project.to_full_api_response
  end

  # Update an existing project.
  def update
    ensure_write_access do
      project = Project.find_by_slug(params[:project_id])
      project.update(project_update_params)
      head :no_content
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

  private

  # These attributes are mandatory when a project is created
  def project_creation_params
    params.permit(:name, :slug)
      .transform_keys { |k| k.underscore }
  end

  # These attributes may be changed once a project has been created
  def project_update_params
    params.permit(:name, :description, :indexPageId, :preview)
      .transform_keys { |k| k.underscore }
  end
end
