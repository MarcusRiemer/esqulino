module Validators
  class GraphqlValidator
    extend JsonSchemaHelper
    def self.validate!(schema_name:, document:)
      result = json_schema_validate(schema_name, document)
      if result.length > 0
        raise GraphQL::ExecutionError.new("Given document of type #{schema_name} does not match the schema. Following errors occured: #{result.to_s}", extensions: { code: 'VALIDATION' })
      end
  end

    def self.validate_presence(attribute, value)
      return if value.present?
      raise GraphQL::ExecutionError, "You must provide a value for #{attribute}"
    end

    def self.is_parsable_json?(*json_arr)
      json_arr.each do |obj|
        !!JSON.parse(obj)
      rescue
        return false
      end
      return true
    end

  end
end
