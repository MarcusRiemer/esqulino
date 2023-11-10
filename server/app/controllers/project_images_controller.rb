class ProjectImagesController < ApplicationController
  include ProjectsHelper
  include JsonSchemaHelper
  include ImageHelper

  # Uploads a new image
  def create
    ensure_write_access do
      if creation_params['image-name'].nil? or creation_params['image-file'].nil?
        render status: 400
      else
        metadata = Image.metadata_create(creation_params['image-name'], params['author-name'], params['author-url'], params['licence-name'], params['licence-url'])
        img = Image.file_new!(params['image-file'].tempfile, current_project, metadata)

        render plain: img.id
      end
    end
  end

  def file_update
    ensure_write_access do
      if params['image-file'].nil? or params['image-file'].tempfile.nil? or params['image_id'].nil?
        render status: 400
      else
        image = Image.new(current_project, params['image_id'])
        if image.exists?
          image.file_update!(params['image-file'].tempfile)
          render status: 200
        else
          render status: 404
        end
      end
    end
  end

  def file_delete
    ensure_write_access do
      image = Image.new(current_project, params['image_id'])

      if image.exists?
        image.file_destroy!
        render status: 200
      else
        render status: 404
      end
    end
  end

  def metadata_show
    image = Image.new(current_project, params['image_id'])

    if image.exists?
      render status: 200, json: image.metadata_show
    else
      render status: 404
    end
  end

  def metadata_update
    ensure_write_access do
      image_id = params['image_id']
      image = Image.new(current_project, image_id)
      if image.exists?
        metadata = Image.metadata_create(params['image-name'], params['author-name'], params['author-url'], params['licence-name'], params['licence-url'])
        image.metadata_update(metadata)
        image.metadata_save
        render status: 200, json: image.metadata_show
      else
        render status: 404
      end
    end
  end

  def list_show
    render status: 200, json: Image.metadata_get_from_file(current_project)
  end

  private

  # These attributes are mandatory when an image is created
  def creation_params
    params.permit('image-name', 'image-file')
  end
end
