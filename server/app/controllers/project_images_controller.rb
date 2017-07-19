class ProjectImagesController < ApplicationController
  include ProjectsHelper
  include ValidationHelper

  def file
    #TODO
    render status => :success
  end

  def metadata_show
    render status => :success, json: { 'name' => 'foo' }
  end
end
