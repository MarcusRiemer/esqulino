class Types::Scalar::QualifiedTypeName < Types::Base::BaseScalar
  def self.coerce_input(value, _context)
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
    Validators::GraphqlValidator.validate!(schema_name: 'QualifiedTypeName', document: value)
    value
  end

  # Validators could be used to check if it fit the client-side declared type
  def self.coerce_result(value, _context)
    Validators::GraphqlValidator.validate!(schema_name: 'QualifiedTypeName', document: value) unless value.nil?
    value
  end
end
