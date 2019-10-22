module EsqulinoError
  # Thrown when a request does not fulfill a certain schema
  class InvalidSchema < Base
    attr_reader :schema_name, :errors

    # @param schema_name [string] The name of the schema that caused the
    #                             validation to fail
    # @param errors [Array<String>] The validation errors
    def initialize(schema_name, errors)
      @schema_name = schema_name
      @errors = errors
      super "Request does not match the schema \"#{schema_name}\"", 400
    end

    # @return [Hash] The errors as reported by the JSON-schema-validator
    def json_data
      {
        "errors" => @errors
      }
    end
  end
end
