class ProjectImagesController < ApplicationController
  include ProjectsHelper
  include ValidationHelper

  def create
    uuid = SecureRandom.uuid
    project_id = current_project.id
    img = Image.new(project_id, uuid)

    render plain: params.inspect + '
' + project_id + '
' + uuid + '
'
  end

  def file_show
    image_id = params['image_id']

    (new Image(current_project.id, image_id)).file_show
  end

  def file_update
    ensure_write_access do
      #TODO
    end
  end

  def file_delete
    ensurce_write_access do
      #TODO
    end
  end

  def metadata_show
    render status => :success, json: { 'name' => 'foo' }
  end

  def metadata_update
    ensure_write_access do
      #TODO
    end
  end
end
