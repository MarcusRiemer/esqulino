# All operations that occur on a project level.
class ProjectsController < ApplicationController
  include ProjectsHelper
  include JsonSchemaHelper
  include UserHelper
  include PaginationHelper

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


  # The preview image for a specific project
  def preview_image
    if current_project.preview_image_exists? then
      send_file current_project.preview_image_path, disposition: 'inline'
    else
      render plain: "Project has no preview image", status: :not_found
    end
  end

  private

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
