# frozen_string_literal: true

module EsqulinoError
  # Thrown when an image_id is unknown
  class UnknownImage < Base
    # @param project_id [string] The id of the project
    # @param image_id [string] The id of the unkown image
    def initialize(project_id, image_id)
      super "Unknown image \"#{image_id}\" in project \"#{project_id}\"", 404
    end
  end
end
