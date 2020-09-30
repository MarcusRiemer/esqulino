class Types::Scalar::SettableDate < Types::Base::BaseScalar

  # @param value [Date,DateTime,String]
  # @return [String]
  def self.coerce_result(value, _ctx)
        case value
        when DateTime
          return value.iso8601
        when Date
          return DateTime.parse(value.to_s).iso8601
        when ::String
          # in case the value is UNSET
          unless value == "UNSET"
            return DateTime.parse(value).iso8601
          end
          value
        else
          return value.iso8601
        end
  rescue StandardError => error
    raise GraphQL::Error, "An incompatible object (#{value.class}) was given to #{self}. Make sure that only Dates, DateTimes, and well-formatted Strings, \"UNSET\" are used with this type. (#{error.message})"
  end

  # @param str_value [String]
  # @return [DateTime]
  def self.coerce_input(str_value, _ctx)
    Validators::SettableDate.validate!(str_value)
    unless str_value == "UNSET"
      DateTime.iso8601(str_value)
    end
    str_value
  end
end
