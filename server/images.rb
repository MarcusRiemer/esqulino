require 'json'
require 'securerandom'
require 'fileutils'

# Represents the image api
class Images
  public

  @@index_file = "images.json"

  # Constructor
  def initialize(global_image_folder)
    @global_image_folder = global_image_folder
  end

  # API Endpoint `/api/images`
  def get_images(project)
    if project.nil? then
      get_global_index()
    else
      get_combined_project_index(project)
    end
  end

  # API Endpoint GET `/api/image/<uuid>`
  def get_image(project, uuid)
    if project.nil? then
      get_image_from_global_folder(uuid)
    else
      get_image_from_project_folder(project, uuid)
    end
  end

  # API Endpoint GET `/api/metadata/<uuid>`
  def get_image_metadata(project, uuid)
    if project.nil? then
      get_metadata_from_global_index(uuid)
    else
      get_metadata_from_project_index(project, uuid)
    end
  end

  # API Endpoint PUT `/api/image/<uuid>`
  def put_image(project, uuid)
    #TODO
  end

  # API Endpoint PUT `api/metadata/<uuid>`
  def put_image_metadata(project, uuid)
    #TODO
  end

  # API Endpoint DELETE `api/image/<uuid>`
  # API Endpoint DELETE `api/metadata/<uuid>`
  def delete_image_and_metadata(project, uuid)
    #TODO
  end

  private

  # returns the image blob from the global image storage or nil if it doesnt exist
  def get_image_from_global_folder(uuid)
    path = File.join(@global_image_folder, uuid[0..1], uuid[2..3], uuid)
    if File.exists?(path) then
      File.read(path)
    else
      nil
    end
  end

  # returns the image blob or nil if it neither exists in the 
  def get_image_from_project_folder(project, uuid)
    path = File.join(project.images, uuid[0..1], uuid[2..3], uuid)
    if File.exists?(path) then
      File.read(path)
    else
      #if project.has_parent? then
        #get_image_from_project_folder(project.parent_project, uuid)
      #else
        get_image_from_global_folder(uuid)
      #end
    end
  end

  # returns the content of the global index, a list of json objects
  def get_global_index()
    path = File.join(@global_image_folder, @@index_file)

    JSON.parse(File.read(path))
  end

  # returns the content of the projects index file, a list of json objects
  def get_project_index(project)
    path = File.join(project.images, @@index_file)

    JSON.parse(File.read(path))
  end

  # returns the full index available to the project
  # the content of the project index
  # the content of the parent projects index
  # the content of the global index
  def get_combined_project_index(project)
    #if project.has_parent? then
      #get_combined_project_index(project.parent_project).merge(get_project_index(project).values().to_json()
    #else
      get_global_index().merge(get_project_index(project)).values().to_json()
    #end
  end

  def get_metadata_from_global_index(uuid)
    path = File.join(@global_image_folder, @@index_file)

    JSON.parse(File.read(path))[uuid]
  end

  def get_metadata_from_project_index(project, uuid)
    path = File.join(project.images, @@index_file)

    local_val = JSON.parse(File.read(path))[uuid]
    if local_val.nil? then
      #if project.has_parent? then
        #get_metadata_from_project_index(project.parent_project, uuid)
      #else
        get_metadata_from_global_index(uuid)
      #end
    else
      local_val
    end
  end

end

