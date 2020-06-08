module Validators
  class GraphqlValidator
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
