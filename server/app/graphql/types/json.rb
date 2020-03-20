

class Types::Json < Types::BaseScalar
  def self.coerce_result(value,context)
    value
  end

  def self.coerce_input(value,context)
    value
  end
end