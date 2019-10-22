module EsqulinoError
  # Thrown when a project is unknown
  class UnknownProject < Base
    # @param project_id [string] The id of the unknown project
    def initialize(project_id)
      super "Unknown project \"#{project_id}\"", 404
    end
  end
end