module SchemaTools
  # Describes how a single column of a certain table references
  # another column in (possibly) another table.
  class SchemaForeignKeyRef
    include ActiveModel::Serializers::JSON

    attr_accessor :from_column, :to_table, :to_column

    def attributes
      { 'from_column' => nil, 'to_table' => nil, 'to_column' => nil }
    end

    def initialize(from_column, to_table, to_column)
      @from_column = from_column
      @to_table = to_table
      @to_column = to_column
    end

    # Serialises this foreign key to JSON, according to the over-the-wire format
    # described in Typescript.
    def to_json(options)
      {
        :from_column => @from_column,
        :to_table => @to_table,
        :to_column => @to_column
      }.to_json(options)
    end
  end
end
