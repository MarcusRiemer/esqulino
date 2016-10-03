require 'sqlite3'

# Describes a single column of a SQLite Table
class SchemaColumn
  attr_reader :index, :name, :type, :not_null, :dflt_value, :primary
  
  def initialize(index, name, type, not_null, dflt_value, pk)
    @index = index
    @name = name
    @type = type
    @not_null = not_null == 1
    @dflt_value = dflt_value
    @primary = pk >= 1
  end

  # Serialises this column to JSON, according to the over-the-wire format
  # described in Typescript.
  def to_json(options)
    {
      :index => @index, :name => @name, :type => @type,
      :not_null => @not_null, :dflt_value => @dflt_value,
      :primary => @primary
    }.to_json(options)
  end
end

# Describes a SQLite table with its columns
class SchemaTable
  attr_reader :name, :columns
  
  def initialize(name)
    @name = name
    @columns = []
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
  
  # Serialises this table to JSON, according to the over-the-wire format
  # described in Typescript.
  def to_json(options)
    { :name => @name, :columns => @columns }.to_json(options)
  end
end

# Describes the schema of a whole database as a handy dictionary
# of tables with their columns.
#
# @param sqlite_file_path [string] The path to the database
# @return [Hash] A hash of SchemaTable instances
def database_describe_schema(sqlite_file_path)
  db = SQLite3::Database.new(sqlite_file_path)

  puts "Describing schema at #{sqlite_file_path} => #{File.exists? sqlite_file_path}"
  
  # Find out names of tables
  table_names = db.execute("SELECT name
                            FROM sqlite_master
                            WHERE type='table'
                            ORDER BY name;")

  tables = []

  # Fill in the column for each table
  table_names.each do |name|

    puts "Table #{name}"
    
    name = name[0]
    
    table_schema = SchemaTable.new name
    db.execute("PRAGMA table_info(#{name})") do |ci|

      column_schema = SchemaColumn.new(ci[0],ci[1],ci[2],ci[3],ci[4],ci[5])
      table_schema.add_column(column_schema)
    end

    tables << table_schema
  end

  return tables
end
