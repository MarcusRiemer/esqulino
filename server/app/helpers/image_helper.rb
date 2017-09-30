require 'filemagic'
require 'RMagick'
include Magick

module ImageHelper
  def file_show
    image_id = params['image_id']
    path = Image.new(current_project, image_id).file_show

    fresh_when last_modified: File.ctime(path).utc

    type = FileMagic.new(FileMagic::MAGIC_MIME).file(path)
    p type
    #do not attempt to resize svg
    if type == "image/svg+xml; charset=us-ascii"
      send_file path, type: type, disposition: 'inline'
    #attempt to resize other formats
    else
      image = shrink_image_from_file_or_nil(path, type, params['width'])

      if image
        send_data image.to_blob, type: image.mime_type, disposition: 'inline'
      else
        send_file path, type: type, disposition: 'inline'
      end
    end
  end

  ##
  # read an image from file, shrink its width to a specified width keeping the aspect ratio
  # if the width is not a valid integer or smaller than the width of the image loaded nil is returned
  # if a width of zero or less is given nil is returned
  #
  # path path to the image in the file system
  # type mimetype of the image as returned by filemagic
  # width target width in pixel
  #
  # return Resized Image or nil
  #
  def shrink_image_from_file_or_nil(path, type, width)
    images = ImageList.new(path)
    res = nil
    begin
      if width and Integer(width) and (Integer(width) < images[0].columns)
        width = Integer(width)
        images.each do |image|
          #unless the height is specified rezize_to_fit will use width as the height
          #this will shrink the width of images in portrait aspect ratio to less than the especified width
          #Float::Infinity is not accepted so a ridiculously high value is used instead
          image.resize_to_fit!(width, width*1000000)
          image.format = case type
                         when "image/jpeg; charset=binary" then "jpeg"
                         when "image/gif; charset=binary" then "jpeg"
                         else "png"
                         end
        end
        res = images
      end
    rescue ArgumentError
    end
    res
  end
end
