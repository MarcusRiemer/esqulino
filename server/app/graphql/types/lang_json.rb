class Types::LangJson < Types::BaseScalar
  def self.coerce_result(value,context)
    byebug
    value
  end

  def self.coerce_input(value,context)
    if Validators::GraphqlValidator.is_parsable_json?(value)
      value = JSON.parse(value)
    end
    Validators::Languages.validate!(value)
    value
  end
end