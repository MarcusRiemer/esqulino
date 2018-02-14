require_dependency 'legacy_project'

class ProjectsController < ApplicationController
  include ProjectsHelper
  include JsonSchemaHelper

  before_action :project, only: [:show, :edit]
  before_action :project_params, only: [:create]
  
  def index
    @projects = Project.all

    render json: @projects
  end

  # Creating a new project via clients post call
  # Setup project directory and sqlite database with project utility class
  def create
    @project = Project.new
    @project.assign_attributes(project_params['project'])
    if @project.save
      Builders::ProjectUtility.new(id: @project.id, db_type: project_params['db_type']).generate
      render json: { 'id' => @project.slug }, :status => 200
    else
      render nothing: true, status: 400
    end
  end

  def show
    project = Project.full.find_by(slug: params[:project_id])
    render json: project.to_full_api_response
  end

  # Update an existing project
  def edit
    # ensure_write_access do
    #   updated_project = ensure_request("ProjectUpdateDescription", request.body.read)

    #   current_project.update_description! updated_project
    #   current_project.save_description

    #   render :status => 200
    # end
    # @project = Project.find_by_slug(params[:project_id])
    project.update(project_params)
    head :no_content
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

  def project
    Project.find_by_slug(params[:project_id])
  end

  def project_params
    params.permit(:name, :slug, :apiVersion, :description, :activeDatabase, :dbType, :project_id, admin: {}, project: {}).transform_keys! { |k| k.underscore }
    # (params.permit!).transform_keys! { |k| k.underscore }
  end
end
