class Types::Scalar::NodeDescription < Types::Base::BaseScalar
  def self.coerce_input(value, _context)
    if Validators::GraphqlValidator.is_parsable_json?(value)
      value = JSON.parse(value)
    end
    Validators::NodeDescription.validate!(value)
    value
  end

  #Validators could be used to check if it fit the client-side declared type
  def self.coerce_result(value, _context)
    Validators::NodeDescription.validate!(value)
    value
  end
end
