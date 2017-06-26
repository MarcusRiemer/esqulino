require 'json'
require 'securerandom'
require 'fileutils'

@@images = new Images("data/images")

# Represents the image api
class Images
  #
  def initialize(global_image_folder)
    @global_image_folder = global_image_folder
  end

  #
  def getImages(project)
    #TODO
  end

  #
  def getImage(project, uuid)
    #TODO
  end

  #
  def getImageMetadata(project, uuid)
    #TODO
  end

  #
  def putImage(project, uuid)
    #TODO
  end

  #
  def putImageMetadata(project, uuid)
    #TODO
  end

  def deleteImageAndMetadata(project, uuid)
    #TODO
  end
end
