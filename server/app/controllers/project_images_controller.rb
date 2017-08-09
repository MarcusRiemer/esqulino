require 'filemagic'

class ProjectImagesController < ApplicationController
  include ProjectsHelper
  include ValidationHelper

  def create
    uuid = SecureRandom.uuid
    metadata = Image.metadata_create(params['image-name'], "params['image-author-name']", "params['image-author-url']")
    img = Image.file_new!(params['image-file'].tempfile, current_project, metadata)

    render plain: params.inspect + '
' + current_project.id + '
' + uuid + '
'
  end

  def file_show
    image_id = params['image_id']

    path = Image.new(current_project, image_id).file_show

    send_file path, :type => FileMagic.new(FileMagic::MAGIC_MIME).file(path), disposition: 'inline'
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

  def list_show
    render status => :success, json: Image.metadata_get_from_file(current_project)
  end
end
