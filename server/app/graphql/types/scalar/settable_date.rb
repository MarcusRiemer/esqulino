class Types::Scalar::SettableDate < Types::Base::BaseScalar
  # @param value [Date,DateTime,String]
  # @return [String]
  def self.coerce_result(value, _ctx)
    case value
    when DateTime
      value.iso8601
    when Date
      DateTime.parse(value.to_s).iso8601
    when ::String
      # in case the value is UNSET
      return DateTime.parse(value).iso8601 unless value == 'UNSET'

      value
    else
      value.iso8601
    end
  rescue StandardError => e
    raise GraphQL::Error, "An incompatible object (#{value.class}) was given to #{self}. Make sure that only Dates, DateTimes, and well-formatted Strings, \"UNSET\" are used with this type. (#{e.message})"
  end

  # @param str_value [String]
  # @return [DateTime]
  def self.coerce_input(str_value, _ctx)
    Validators::SettableDate.validate!(str_value)
    DateTime.iso8601(str_value) unless str_value == 'UNSET'
    str_value
  end
end
