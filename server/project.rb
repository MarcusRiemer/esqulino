require 'sqlite3'
require 'json'
require 'yaml'
require 'securerandom'

# Describes a single column of a SQLite Table
class SchemaColumn
  attr_reader :index, :name, :type, :not_null, :dflt_value, :primary
  
  def initialize(index, name, type, not_null, dflt_value, pk)
    @index = index
    @name = name
    @type = type
    @not_null = not_null == 1
    @dflt_value = dflt_value
    @primary = pk == 1
  end

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

  def to_json(options)
    { :name => @name, :columns => @columns }.to_json(options)
  end
end

# Describes the schema of a whole database as a handy dictionary
# of tables with their columns.
#
# @param sqlite_file_path [String] Path to database file
# @return [Hash] A hash of SchemaTable instances
def database_describe_schema(sqlite_file_path)
  db = SQLite3::Database.new(sqlite_file_path)

  # Find out names of tables
  table_names = db.execute("SELECT name
                            FROM sqlite_master
                            WHERE type='table'
                            ORDER BY name;")

  tables = []

  # Fill in the column for each table
  table_names.each do |name|
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

# Strips information from a project description that is not meant to be
# public. Technically this works by copying over a subset of properties
# that are known, so unknown properties will *always* get stripped. Or
# to put it in simpler terms: This approach uses a whitelist, you can't
# add arbitrary fields to the projects description and hope that they
# will be visible on the client.
#
# @param whole_info [Hash] The whole JSON / YAML structure
def project_public_info(whole_info)
  to_return = {}

  to_return['name'] = whole_info['name']
  to_return['description'] = whole_info['description']
  to_return['id'] = whole_info['id']
  to_return['preview'] = whole_info['preview']

  return to_return;
end

# Retrieves all queries that are part of the given project.
#
# @param project_folder [string] The projects root folder
# @param whole_info [Hash] The "over-the-wire" format that describes a project
def project_load_queries(project_folder, whole_info)
  to_return = []

  query_folder = File.join(project_folder, "queries")
  Dir.glob(query_folder + "/*.json").each do |query_file|
    # Load the model from disk
    sql_model = YAML.load_file(query_file)

    # Put the id into the model, which is part of the filename
    sql_model['id'] = File.basename(query_file, ".json")
    

    # Append it to the list of values that should be returned
    to_return << sql_model
  end

  return to_return
end
