class ApplicationRecord < ActiveRecord::Base
  self.abstract_class = true
end

# Just because you could, that doesn't mean you should: This validator is used to ensure
# that the JSON docuemnts inside the SQL database adhere to a specific schema. 
class JsonSchemaValidator < ActiveModel::Validator
  include ValidationHelper

  # Sets up validation for a specific property against a specific schema
  #
  # @param description_name [string] The name of the JSON schema to use.
  # @param property_name [string] The name of the property on the record
  #                               that needs to be validated.
  def initialize(description_name, property_name)
    @description_name = description_name
    @property_name = property_name
  end

  # Runs the actual validation
  def validate(record)
    
  end
end
