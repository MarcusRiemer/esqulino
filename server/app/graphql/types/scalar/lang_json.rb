class Types::Scalar::LangJson < Types::Base::BaseScalar
  def self.coerce_input(value,context)
    case value
    when String
      begin
        value = JSON.parse(value)
      rescue
        raise GraphQL::ExecutionError.new("#{self.class.name} value is not a parsable JSON Object", extensions: { code: 'INVALID_PARAM' })
      end
    when ActionController::Parameters
      value = value.to_unsafe_hash
    when nil
      return value
    else
      raise GraphQL::ExecutionError.new("Unexpected parameter: #{value} for #{self.class.name} class", extensions: { code: 'INVALID_PARAM' })
    end
    Validators::Languages.validate!(value)
    value
  end

  def self.coerce_result(value,context)
    Validators::Languages.validate!(value)
    value
  end
end
