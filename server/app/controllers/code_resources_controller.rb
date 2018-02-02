# Handles low level operations on CodeResource, basicly the whole
# CRUD cycle. More specialised operations for specific types of
# resouces (pages, queries, ...) can be found in the respective
# controllers.
class CodeResourcesController < ApplicationController

  # Create a new resource that is part of a specific project
  def create
    project_id = params[:project_id]
    proj = Project.find_by id: project_id
    if proj
      res = proj.code_resources.new(code_resource_params)
      if res.save
        render :json => res, :status => 200
      else
        render :json => { 'errors' => res.errors }, :status => 400
      end
    else
      raise UnknownProjectError, project_id
    end
  end

  # Updates a specific resource
  def update
    resource = CodeResource.find(params[:code_resource_id])
    if resource.update_attributes(code_resource_params)
      render :json => resource, :status => 200
    else
      render :json => { 'errors' => res.errors }, :status => 400
    end
  end

  def destroy
    begin
      CodeResource.destroy(params[:code_resource_id])
      render :status => 200
    rescue ActiveRecord::RecordNotFound
      render :status => 404
    end
  end

  private

  # Possible parameters for code resources
  def code_resource_params
    params.permit(:name, :ast => {})
  end
end
