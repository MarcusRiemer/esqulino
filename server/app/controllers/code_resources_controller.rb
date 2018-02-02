class CodeResourcesController < ApplicationController
  def create
    project_id = params[:project_id]
    proj = Project.find_by id: project_id
    if proj
      res = proj.code_resources.new(code_resource_params)
      if res.save
        render :json => { 'id' => res.id }, :status => 200
      else
        render :json => { 'errors' => res.errors }, :status => 400
      end
    else
      raise UnknownProjectError, project_id
    end
  end

  private

  # Possible parameters for code resources
  def code_resource_params
    params.permit(:name, :ast)
  end
end
