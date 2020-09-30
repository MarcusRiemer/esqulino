module Validators
  class SettableDate
    def self.validate!(str_value)
      unless str_value == "UNSET" || is_date?(str_value)
        raise GraphQL::ExecutionError, "Invalid value \"#{str_value}\" for custom scalar type SettableDate"
      end
    end

    def self.is_date?(val)
      DateTime.iso8601(val)
    rescue ArgumentError, TypeError
      false
    end
  end
end