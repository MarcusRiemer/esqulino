# Provides access to a globally available Validator instance 
module JsonSchemaHelper
  @@json_schema_storage = JsonSchemaStorage.new Rails.configuration.sqlino['schema_dir']

  # Validates the given object against the schema with the given name
  #
  # @param object [Hash] Any JSON-compatible structure
  # @param schema_name [string] The name of the schema
  def json_schema_validate(schema_name, document)
    schema = @@json_schema_storage.get_schema schema_name
    
    JSON::Validator.fully_validate(schema, document,
                                   :strict => false,
                                   :errors_as_objects => true,
                                   :validate_schema => true,
                                   :parse_data => false)
  end
  
  # Ensures that the given body of a request matches the given schema
  #
  # @param schema_name [string] The ID of the schema to validate against
  # @param body_string [string] The string representation of the object
  #                             that requires a check.
  def ensure_request(schema_name, body_string)
    # Loading the actual body
    body = JSON.parse(body_string)

    # Making sure it fits against a schema
    result = self.json_schema_validate(schema_name, body)

    if result.length > 0 then
      raise InvalidSchemaError.new(schema_name, result)
    else
      return body
    end
  end
end
