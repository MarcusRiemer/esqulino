module EsqulinoError
  # Thrown when a query inside a project is unknown
  class UnknownQuery < Base
    # @param project_id [string] The id of the unknown project
    # @param query_id [string] The id of the unknown query
    def initialize(project_id, query_id, part = "model")
      super "Unknown query (#{part}) \"#{query_id}\" in project \"#{project_id}\"", 404
    end
  end
end
