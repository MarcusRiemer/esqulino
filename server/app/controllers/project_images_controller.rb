require 'filemagic'

class ProjectImagesController < ApplicationController
  include ProjectsHelper
  include ValidationHelper

  def create
    metadata = Image.metadata_create(params['image-name'], params['author-name'], params['author-url'])
    img = Image.file_new!(params['image-file'].tempfile, current_project, metadata)

    render plain: img.id
  end

  def file_show
    image_id = params['image_id']

    path = Image.new(current_project, image_id).file_show

    send_file path, :type => FileMagic.new(FileMagic::MAGIC_MIME).file(path), disposition: 'inline'
  end

  def file_update
    ensure_write_access do
      Image.new(current_project, params['image_id']).file_update!(params['image-file'].tempfile)
      render status => :success
    end
  end

  def file_delete
    ensurce_write_access do
      #TODO
    end
  end

  def metadata_show
    image_id = params['image_id']
    render status => :success, json: Image.new(current_project, image_id).metadata_show
  end

  def metadata_update
    ensure_write_access do
      image_id = params['image_id']
      metadata = Image.metadata_create(params['image-name'], params['author-name'], params['author-url'])
      img = Image.new(current_project, image_id)
      img.metadata_update(metadata)
      img.metadata_save
      render status => :success, json: img.metadata_show
    end
  end

  def list_show
    render status => :success, json: Image.metadata_get_from_file(current_project)
  end
end
