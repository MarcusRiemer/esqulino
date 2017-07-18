class ProjectImagesController < ApplicationController
  include ProjectsHelper
  include ValidationHelper

  def metadata
    render status => :success, json: { 'name' => 'foo' }
  end
end
