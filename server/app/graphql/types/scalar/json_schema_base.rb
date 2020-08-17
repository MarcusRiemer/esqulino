class Types::Scalar::JsonSchemaBase < GraphQL::Schema::Scalar
  class << self
    # @return [Class] A GraphQL scalar type which validates using the given `json_schema`
    def for(json_schema)
      Class.new(self) do
        # manually set `graphql_name`, because this class isn't a Ruby constant
        graphql_name "#{json_schema}JSON"
        # Assign the json schema name, to be used for validation
        self.json_schema = json_schema
      end
    end

    # @return [String] The name of the schema to use, in `Validators:: ...`
    attr_accessor :json_schema
  end

  def self.coerce_input(value, _context)
    Validators.const_get(self.class.json_schema).validate!(value)
    value
  end

  def self.coerce_result(value, _context)
    Validators.const_get(self.class.json_schema).validate!(value)
    value
  end
end
