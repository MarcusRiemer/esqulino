# All operations that occur on a project level.
class ProjectsController < ApplicationController
  include ProjectsHelper
  include JsonSchemaHelper
  include UserHelper

  # Lists all projects
  def index
    order_key = project_list_params.fetch("order_field", "name")
    order_dir = project_list_params.fetch("order_direction", "asc")

    if (not Project.has_attribute? order_key or not ["asc", "desc"].include? order_dir)
      raise EsqulinoError::InvalidOrder.new(order_key, order_dir)
    end

    response_query = Project
                       .only_public
                       .order({ order_key => order_dir})
                       .limit(project_list_params.fetch("limit", 100))
                       .offset(project_list_params.fetch("offset", 0))

    render json: {
             data: response_query.map{|p| p.to_list_api_response},
             meta: {
               totalCount: Project.only_public.count
             }
           }
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
    begin
      authorize Project, :create?
      creation_params = append_current_user(project_creation_params)
      project = Project.new(creation_params)
      if project.save
        ProjectMailer.with(project: project).created_admin.deliver_later

        render json: { 'id' => project.slug }, :status => 200
      else
        render :json => { 'errors' => project.errors }, :status => 400
      end
    rescue Pundit::NotAuthorizedError => e
      error_response("Please log in")
    end
  end

  # Update an existing project.
  def update
    begin
      authorize current_project
      current_project.update project_update_params # Simple properties
      current_project.update project_used_block_languages_params # Used block languages

      render json: current_project.to_project_api_response
    rescue Pundit::NotAuthorizedError => e
      error_response("You need the permission")
    end
  end

  # Destroy an existing project and all of its associated data
  def destroy
    begin
      authorize current_project

      current_project.destroy
    rescue Pundit::NotAuthorizedError => e
      error_response("You need the permission")
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

  def append_current_user(hash)
    hash["user"] = current_user
    return hash
  end

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

  # These attributes
  def project_list_params
    params.permit(:limit, :offset, :orderField, :orderDirection)
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
