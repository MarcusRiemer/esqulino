module EsqulinoError
  # Thrown when a query that is about to be executed doesn't have all
  # parameters that are required.
  class InvalidQueryRequest < Base
    # @param query [Query] The query that couldn't be run.
    # @param query_params [Hash]
    def initialize(query, available_params, required_params)
      @query = query
      @available_params = available_params
      @required_params = required_params

      super "Not enough parameters to execute \"#{query.name}\"", 400
    end

    def json_data
      {
        'availableParameters' => @available_params,
        'requiredParameters' => @required_params
      }
    end
  end
end
