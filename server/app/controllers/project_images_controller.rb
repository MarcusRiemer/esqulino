class ProjectImagesController < ApplicationController
  include ProjectsHelper
  include ValidationHelper

  def create
    render plain: params.inspect
  end
  
  def metadata_show
    render status => :success, json: { 'name' => 'foo' }
  end
end
