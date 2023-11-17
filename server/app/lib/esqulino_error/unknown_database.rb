# frozen_string_literal: true

module EsqulinoError
  # Thrown when a whole database is unknown
  class UnknownDatabase < Base
    # @param project_id [string] The id of the project
    # @param database_name [string] The name of the missing database
    def initialize(project_id, database_name)
      super "Unknown database \"#{database_name}\" in project \"#{project_id}\"", 404
    end
  end
end
