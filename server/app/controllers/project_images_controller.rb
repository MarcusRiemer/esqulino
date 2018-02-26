class ProjectImagesController < ApplicationController
  include ProjectsHelper
  include JsonSchemaHelper
  include ImageHelper

  def create
    ensure_write_access do
      metadata = Image.metadata_create(params['image-name'], params['author-name'], params['author-url'], params['licence-name'], params['licence-url'])
      img = Image.file_new!(params['image-file'].tempfile, current_project, metadata)

      render plain: img.id
    end
  end

  def file_update
    ensure_write_access do
      if params['image-file'].nil? or params['image-file'].tempfile.nil? then
        render :status => 400
      else
        Image.new(current_project, params['image_id']).file_update!(params['image-file'].tempfile)
        render status => :success
      end
    end
  end

  def file_delete
    ensure_write_access do
      Image.new(current_project, params['image_id']).file_destroy!
    end
  end

  def metadata_show
    image_id = params['image_id']
    render status => :success, json: Image.new(current_project, image_id).metadata_show
  end

  def metadata_update
    ensure_write_access do
      image_id = params['image_id']
      metadata = Image.metadata_create(params['image-name'], params['author-name'], params['author-url'], params['licence-name'], params['licence-url'])
      img = Image.new(current_project, image_id)
      img.metadata_update(metadata)
      img.metadata_save
      render status => :success, json: img.metadata_show
    end
  end

  def list_show
    render status => :success, json: Image.metadata_get_from_file(current_project)
  end

  # Access to the current project
  def current_project
    @current_project ||= Project.find_by(slug: params['project_id'])
  end
end
