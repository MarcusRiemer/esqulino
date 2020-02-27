# Handles low level operations on CodeResource, basicly the whole
# CRUD cycle. More specialised operations for specific types of
# resouces (pages, queries, ...) can be found in the respective
# controllers.
class CodeResourcesController < ApplicationController

  include JsonSchemaHelper

  # Create a new resource that is part of a specific project
  def create
    project_slug = params[:project_id]
    proj = Project.find_by slug: project_slug
    if proj
      res = proj.code_resources.new(code_resource_create_params)
      if res.save
        render :json => res.to_full_api_response, :status => 200
      else
        render :json => { 'errors' => res.errors }, :status => 400
      end
    else
      raise UnknownProjectError, project_id
    end
  end

  # Updates a specific resource
  def update
    # See what the new data looks like
    request_data = ensure_request("CodeResourceRequestUpdateDescription", request.body.read)
    update_params = request_data
                      .dig("resource")
                      .transform_keys { |k| k.underscore }

    resource = CodeResource.find(params[:code_resource_id])

    ApplicationRecord.transaction do
      # Do the actual update of the code resource
      if resource.update(update_params)

        # Do updates on dependant resources

        render :json => resource, :status => 200
      else
        render :json => { 'errors' => resource.errors }, :status => 400
      end
    end
  end

  # Clones a specific resource
  def clone
    original = CodeResource.find(params[:code_resource_id])

    cloned = original.dup
    cloned.save!

    render :json => cloned.to_full_api_response, :status => 200
  end

  def destroy
    begin
      CodeResource.destroy(params[:code_resource_id])
      render :status => 204
    rescue ActiveRecord::RecordNotFound
      render :status => 404
    end
  end

  private

  # Possible parameters when creating
  def code_resource_create_params
    params
      .permit(:name, :programmingLanguageId, :blockLanguageId, :ast => {})
      .transform_keys { |k| k.underscore }
  end
end
