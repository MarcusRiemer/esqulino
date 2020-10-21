module SchemaTools
  class SchemaForeignKey
    include ActiveModel::Serializers::JSON

    attr_accessor :references

    def attributes
      { 'references' => nil }
    end

    def initialize()
      @references = []
    end

    # Adds a foreign key to the list
    # @param foreign_key The foreign keys to add
    def add_foreign_key(foreign_key)
      @references.push(foreign_key)
    end

    # Checks whether the given column is used as a foreign key
    # @param column [SchemaColumn] The column to test
    def is_column_fk?(column)
      @references.any? { |ref| ref.from_column == column.name }
    end

    # Serialises the foreign key list to JSON, according to the over-the-wire format
    # described in Typescript.
    def to_json(options)
      {
        :references => @references
      }.to_json(options)
    end
  end
end
