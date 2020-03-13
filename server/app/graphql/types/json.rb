

class Types::Json < Types::BaseScalar
  def self.coerce_result(value,context)
    value.to_s
  end

  def self.coerce_input(value,context)
    value
  end
end