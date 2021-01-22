# Just because you could, that doesn't mean you should: This validator is used to ensure
# that the JSON docuemnts inside the SQL database adhere to a specific schema.
class JsonSchemaValidator < ActiveModel::EachValidator
  include JsonSchemaHelper

  # Sets up validation for a specific property against a specific schema
  #
  # @param description_name [string] The name of the JSON schema to use.
  def initialize(args)
    super
    @description_name = args[:with]
  end

  # Runs the actual validation against a concrete record.
  #
  # @param record The model that contains the document to be tested
  # @param attribute The name of the tested attribute
  # @param value The value of the tested attribute
  def validate_each(record, attribute, value)
    validation_errors = self.json_schema_validate(@description_name, value)

    validation_errors.each do |err|
      # We don't want to see the violated schema repeated again and again
      record.errors.add(attribute, message: err.except("schema", "root_schema"))
    end
  end
end
