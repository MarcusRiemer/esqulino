require 'json'

# Validates JSON requests and responses against pre-loaded
# JSON schemas.
class JsonSchemaStorage
  attr_reader :schemas

  # Loads all schemas from the given directory
  #
  # @param schema_dir [string] A path containing JSON schema files
  def initialize(schema_dir)
    @schemas = {}
    @schema_dir = File.realdirpath(schema_dir)

    Dir.glob(@schema_dir + "/*.json").each do |schema_file|
      schema_name = File.basename(schema_file, ".json")

      # Some files share the .json extension but are not a schema
      if ["Makefile", "package"].include? schema_name then
        next
      end

      schema_content = File.read(schema_file)
      schema = JSON.load(schema_content, :quirks_mode => true)

      @schemas[schema_name] = schema
    end
  end

  # Retrieves a schema by its name
  #
  # @param schema_name [string] The name of the schema
  def get_schema(schema_name)
    # Ensuring the schema exists
    schema = @schemas[schema_name]
    if (schema == nil) then
      raise ArgumentError, "Could not validate against unknown schema \"#{schema_name}\""
    end

    return schema
  end

  # @return [string] Path for a schema with the given name
  def schema_path(name)
    File.join(@schema_dir, name + ".json")
  end
end
