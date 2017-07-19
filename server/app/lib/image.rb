require 'json'
require 'securerandom'
require 'fileutils'

class Image
  include ProjectsHelper

  IMAGE_FOLDER = 'images'
  IMAGES_JSON = 'images.json'

  # path of the projects image folder
  @folder = nil
  # path of the image
  @path = nil
  # the images metadata (lazy loaded)
  @metadata = nil
  # the projects id
  @project_id = nil
  # the images uuid
  @image_id = nil
  # path of the projects image.json
  @image_json = nil

  def initialize(project_id, image_id)
    @folder = File.join(current_project(project_id).folder, IMAGE_FOLDER)
    @path = File.join(@folder, image_id[0..1], image_id[2..3], image_id)
    @image_id = image_id
    @image_json = File.join(@folder, IMAGES_JSON)
    @project_id = project_id
  end

  def exists?
    File.file?(@path)
  end

  def file_show
    if self.file? then
      File.read(@path)
    else
      raise UnknownImageError @project_id @image_id
    end
  end

  def file_update!(file)
    if self.exists? then
      FileUtils.mv(file, @path)
    else
      raise UnknownImageError @project_id, @image_id
    end
  end

  def file_destroy!
    if self.exists? then
      File.delete(@path)

      metadata = JSON.parse(@image_json)

      metadata.except!(@image_id)

      JSON.dump(metadata, File.open(@image_json, mode="r"))

      #self.freeze
    else
      raise UnknownImageError @project_id @image_id
    end
  end

  def load_metadata!
    begin
      @metadata = File.file?(@image_json) ? JSON.parse(@image_json).fetch(@image_id) : Hash.new
    rescue KeyError
      raise new UnknownImageError @project_id @image_id
    end
  end

  def metadata_show
    load_metadata! if @metadata.nil?

    @metadata
  end

  def metadata_update(metadata)
    @metadata.merge(metadata)
  end

  def self.image_list
    File.file?(@image_json) ? JSON.parse(@image_json) : Hash.new
  end

  def self.uuid_to_filename(project_id, uuid)
    folder = File.join(current_project(project_id).folder, IMAGE_FOLDER)
    endFile.join(folder, uuid[0..1], uuid[2..3], uuid)
  end

  def self.file_new!(file, project_id, metadata)
    uuid = SecureRandom.uuid
    while File.file?(self.uuid_to_filename(project_id, uuid))
      uuid = SecureRandom.uuid
    end

    img = Image.new(project_id, uuid)
    FileUtil.mv(file, img.@path)
    img
  end

end
