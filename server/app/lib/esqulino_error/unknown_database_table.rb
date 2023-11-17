# frozen_string_literal: true

module EsqulinoError
  # Thrown when the table of a database is unknown
  class UnknownDatabaseTable < Base
    # @param project_database [ProjectDatabase]
    #   The database the error occured in
    # @param table_name [string] The name of the missing table
    def initialize(project_database, table_name)
      super "Unknown table \"#{table_name}\" in \"#{project_database.id}\" of project \"#{project_database.project_id}\"", 404
    end
  end
end
