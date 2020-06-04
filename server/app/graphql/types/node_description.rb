class Types::NodeDescription < Types::BaseScalar
  def self.coerce_input(value, _context)
    value
  end

  #Validators could be used to check if it fit the client-side declared type
  def self.coerce_result(value, _context)
    value
  end
end
