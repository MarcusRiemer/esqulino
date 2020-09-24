module SchemaTools
  # Describes a SQLite table with its columns
  class SchemaTable
    include ActiveModel::Serializers::JSON

    attr_accessor :name, :columns, :foreign_keys

    def attributes
      {'name' => nil, 'columns' => nil, 'foreign_keys' => nil, 'system_table' => nil}
    end

    def initialize(name)
      @name = name
      @columns = []
      @foreign_keys = []
    end

    # Adds a new column based on its index
    # @param schema_column [SchemaColumn] The column to add
    def add_column(schema_column)
      @columns[schema_column.index] = schema_column
    end

    # Access a column via its index
    # @param idx [Integer] The index of the column
    # @return [SchemaColumn]
    def [](idx)
      return @columns[idx]
    end

    # @return [Boolean] True, if the table is a system table
    def system?
      @name.start_with? 'sqlite_'
    end

    def system_table
      system?
    end

    def systemTable
      system?
    end

    def foreignKeys
      @foreign_keys
    end

    # Checks whether the given column is used as a foreign key
    # @param column [SchemaColumn] The column to test
    def is_column_fk?(column)
      @foreign_keys.any? { |ref| ref.is_column_fk? column }
    end

    # Adds the information about the foreign keys of this table
    # @param foreign_keys The foreign keys to add
    def add_foreign_keys(foreign_keys)
      @foreign_keys.push(foreign_keys)
    end

    # Serialises this table to JSON, according to the over-the-wire format
    # described in Typescript.
    def to_json(options)
      {
        :name => @name,
        :columns => @columns,
        :foreignKeys => @foreign_keys,
        :systemTable => system?
      }.to_json(options)
    end
  end
end