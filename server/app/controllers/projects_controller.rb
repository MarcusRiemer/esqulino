require_dependency 'legacy_project'

# All operations that occur on a project level.
class ProjectsController < ApplicationController
  include ProjectsHelper
  include JsonSchemaHelper

  # Lists all projects
  def index
    render json: Project.only_public.map{|p| p.to_list_api_response}
  end

  # Retrieves all information about a single project. This is the only
  # request the client will make to retrieve the *whole* project with
  # *everything* that is required to render it properly.
  def show
    project = Project.full.find_by!(slug: params[:project_id])
    render json: project.to_full_api_response
  end

  # Apart from creating the database object this action also needs to
  # set up the directory layout for project assets that are stored
  # on the disk. Thankfully the Project-model takes care of the whole
  # filesystem stuff.
  def create
    project = Project.new(project_creation_params)

    if project.save
      render json: { 'id' => project.slug }, :status => 200
    else
      render :json => { 'errors' => project.errors }, :status => 400
    end
  end

  # Update an existing project.
  def update
    ensure_write_access do
      project = Project.find_by(slug: params[:project_id])
      project.update project_update_params # Simple properties
      project.update project_used_block_languages_params # Used block languages

      render json: project.to_project_api_response
    end
  end

  # Destroy an existing project and all of its associated data
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

  # The references to block languages that are part of this project.
  # All of these references may be updated.
  def project_used_block_languages_params
    used_block_languages = params[:projectUsesBlockLanguages]
    if used_block_languages then
      attributes = used_block_languages
                     .map { |used| used.transform_keys! { |k| k.underscore } }
                     .each { |used| used.permit! }
      to_return = ActionController::Parameters
                    .new({ "project_uses_block_languages_attributes" => attributes})
                    .permit!
      return (to_return)
    else
      return ({})
    end
  end
end
