# Provides access to a globally available Validator instance
module JsonSchemaHelper
  @@json_schema_storage = JsonSchemaStorage.new Rails.configuration.sqlino['schema_dir']

  # Validates the given object against the schema with the given name
  #
  # @param schema_name [string] The name of the schema
  # @param object [Hash] Any JSON-compatible structure
  # @return [Hash] Array of errors that occurred during validation
  def json_schema_validate(schema_name, document)
    schema = @@json_schema_storage.get_schema schema_name

    schemer = JSONSchemer.schema(schema)
    schemer.validate(document).to_a
  end

  # Validates the given object against the schema with the given name
  #
  # @param object [Hash] Any JSON-compatible structure
  # @param schema_name [string] The name of the schema
  #
  # @return The original document (if valid), otherwise an exception is raised
  def ensure_valid_document(schema_name, document)
    # Making sure it validates against the requested schema
    result = self.json_schema_validate(schema_name, document)

    if result.length > 0
      raise EsqulinoError::InvalidSchema.new(schema_name, result)
    else
      return document
    end
  end

  # Ensures that the given body of a request matches the given schema
  #
  # @param schema_name [string] The ID of the schema to validate against
  # @param body_string [string] The string representation of the object
  #                             that requires a check.
  def ensure_request(schema_name, body_string)
    # Loading the actual body
    body = JSON.parse(body_string)

    ensure_valid_document(schema_name, body)

    # In the case of a request: All keys of the top level document
    # should be in "snake_case" as they might be immediately mapped
    # to a model.
    return body.transform_keys { |k| k.underscore }
  end

  # Returns the path the given schema would be found under
  def schema_path(name)
    @@json_schema_storage.schema_path(name)
  end
end
