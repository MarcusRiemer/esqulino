# frozen_string_literal: true

require 'filemagic'
require 'mini_magick'

module ImageHelper
  def file_show
    image_id = params['image_id']

    # Grab the image to check its type
    path = Image.new(current_project, image_id).file_show
    type = FileMagic.new(FileMagic::MAGIC_MIME).file(path)

    # do not attempt to resize svg
    if type == 'image/svg+xml; charset=us-ascii'
      send_file path, type:, disposition: 'inline'
    # attempt to resize other formats
    else
      image = shrink_image_from_file_or_nil(path, type, params['width'])
      if image
        send_data image.to_blob, type: image.mime_type, disposition: 'inline'
      else
        send_file path, type:, disposition: 'inline'
      end
    end

    fresh_when last_modified: File.ctime(path).utc
  end

  # read an image from file, shrink its width to a specified width keeping the aspect ratio
  # if the width is not a valid integer or smaller than the width of the image loaded nil is returned
  # if a width of zero or less is given nil is returned
  #
  # @param path path to the image in the file system
  # type mimetype of the image as returned by filemagic
  # width target width in pixel
  #
  # return Resized Image or nil
  #
  def shrink_image_from_file_or_nil(path, _type, width)
    res = nil
    begin
      image = MiniMagick::Image.open(path)
      if width && Integer(width) && (Integer(width) < image.width)
        width = Integer(width)

        image.resize "#{width}x"
        res = image
      end
    rescue ArgumentError
    end
    res
  end
end
