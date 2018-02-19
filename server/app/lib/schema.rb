require 'sqlite3'

# Describes a single column of a SQLite Table
class SchemaColumn
  attr_accessor :index, :name, :type, :not_null, :dflt_value, :primary

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

# Describes how a single column of a certain table references
# another column in (possibly) another table.
class SchemaForeignKeyRef
  attr_accessor :from_column, :to_table, :to_column

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

class SchemaForeignKey
  attr_accessor :references

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

# Describes a SQLite table with its columns
class SchemaTable
  attr_accessor :name, :columns, :foreign_keys

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
      :foreign_keys => @foreign_keys,
      :system_table => system?
    }.to_json(options)
  end
end

# Describes the schema of a whole database as a handy dictionary
# of tables with their columns.
#
# @param sqlite_db [string|SQLite3::Database]
#   Path to the database or an instance of it
# @return [Hash] A hash of SchemaTable instances
def database_describe_schema(sqlite_db)
  db = if sqlite_db.is_a? String then
         SQLite3::Database.new(sqlite_db)
       else
         sqlite_db
       end

  # Find out names of tables
  table_names = db.execute("SELECT name
                            FROM sqlite_master
                            WHERE type='table'
                            ORDER BY name;")

  tables = []

  # Fill in the column for each table
  table_names.each do |name|
    # Find out everything about the table itself
    name = name[0]
    table_schema = SchemaTable.new name
    db.execute("PRAGMA table_info(#{name})") do |ci|
      column_schema = SchemaColumn.new(ci[0],ci[1],ci[2],ci[3],ci[4],ci[5])
      table_schema.add_column(column_schema)
    end

    # Get all foreign keys in a list and append them to the table
    foreign_keys_table = db.execute("PRAGMA foreign_key_list(#{name})")

    # A foreign key may consist of multiple columns, so we group all
    # columns that belong to the same foreign key
    grouped_foreign_keys = foreign_keys_table.group_by{ |fk| fk[0]}
    grouped_foreign_keys.each do |key, value|
      foreign_key_comp = SchemaForeignKey.new()
      # Add all columns that are part of this particular foreign key
      value.each do |fk|
        foreign_key_ref = SchemaForeignKeyRef.new(fk[3], fk[2], fk[4])
        foreign_key_comp.add_foreign_key(foreign_key_ref)
      end
      table_schema.add_foreign_keys(foreign_key_comp)
    end

    tables << table_schema
  end

  return tables
end
