class Types::LangJson < Types::BaseScalar
  def self.coerce_result(value,context)
    value
  end

  def self.coerce_input(value,context)
    if Validators::GraphqlValidator.json?(value)
      value = JSON.parse(value)
    end
    Validators::Languages.validate!(value)
    value
  end
end