require 'sqlite3'
require 'json'
require 'yaml'
require 'securerandom' # To generate UUIDs
require 'fileutils'    # To create directory trees

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
# @param project_folder [string] The projects root folder
# @return [Hash] A hash of SchemaTable instances
def database_describe_schema(project_folder)
  sqlite_file_path = File.join(project_folder, "db.sqlite")
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

# Throws an exception if the given folder is not a valid
# esqulino project.
#
# @param project_folder [string] The projects root folder
def assert_project_dir(project_folder)
  
  if not File.directory? project_folder
    raise %{Project folder "#{project_folder}" does not exist}
  end
  
  project_config_file = File.join(project_folder, "config.yaml")
  if not File.exists? project_config_file
    raise %{"config.yaml" does not exist in "#{project_folder}"}
  end
end

# Strips information from a project description that is not meant to be
# public. Technically this works by copying over a subset of properties
# that are known, so unknown properties will *always* get stripped. Or
# to put it in simpler terms: This approach uses a whitelist, you can't
# add arbitrary fields to the projects description and hope that they
# will be visible on the client.
#
# @param whole_info [Hash] The whole JSON / YAML structure
#
# @return [Hash] The filtered JSON / YAML structure
def project_public_info(whole_info)
  to_return = {}

  to_return['name'] = whole_info['name']
  to_return['description'] = whole_info['description']
  to_return['id'] = whole_info['id']
  to_return['preview'] = whole_info['preview']

  return to_return;
end

# Loads a project from disk
#
# @param project_folder [string] The projects root folder
#
# @return [Hash] The
def read_project(project_folder)
  # Load data from disk and strip any private data
  project = YAML.load_file(File.join(project_folder, "config.yaml"));
  project = project_public_info(project);
  
  # Put the schema into it
  project['schema'] = database_describe_schema(project_folder)
  
  # Load all related queries
  project['queries'] = project_load_queries(project_folder)

  return (project)
end

# Updates the project at the given path with the information found
# in the
#
#
def update_project_description(project_folder, updated_project)
  # Load project from disk
  project_filename = File.join(project_folder, "config.yaml")
  project = YAML.load_file(project_filename);

  # Override properties from this project with properties from the
  # updated project.
  to_store = project.merge(updated_project)

  File.open(project_filename, "w") do |f|
    f.write(to_store.to_yaml)
  end

  return (to_store['id'])
end

# Retrieves all queries that are part of the given project.
#
# @param project_folder [string] The projects root folder
#
# @return [List] A list of "over the wire" descriptions of queries
def project_load_queries(project_folder)
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

# Stores a given query in the context of a given project. For the moment
# this requires the client to provide the serialized SQL string, because
# the implementation of that serialization step is written in Typescript.
#
# @param project_folder [string] The projects root folder
# @param query_info [Hash] The query model and it's SQL representation.
# @param given_query_id [string] The id of this query
#
# @return The id of the stored query
def project_store_query(project_folder, query_info, given_query_id)
  query_folder = File.join(project_folder, "queries")

  # Ensuring that the project folder has a "queries" subfolder
  if not File.directory?(query_folder)
    FileUtils.mkdir_p(query_folder)
  end

  # Possibly set a new query id
  query_id = given_query_id || SecureRandom.uuid
  query_info['model']['id'] = query_id
  
  # Filename with various extensions
  query_filename = File.join(query_folder, query_id)
  query_filename_sql = query_filename + ".sql"
  query_filename_json = query_filename + ".json"

  File.open(query_filename_json, "w") do |f|
    f.write(query_info['model'].to_json)
  end

  # Is the SQL string part of the information?
  if query_info.has_key? 'sql' then
    # Yes, simply store it
    File.open(query_filename_sql, "w") do |f|
      f.write(query_info['sql'])
    end
  else
    # No, delete a possibly existing sql file. We prefer having no SQL
    # string at all instead of working with a older state of the query.
    File.delete query_filename_sql if File.exists? query_filename_sql
  end

  return query_id
end

# Deletes an existing query
#
# @param project_folder [string] The projects root folder
# @param query_id [string] The id of the query
def project_delete_query(project_folder, query_id)
  query_folder = File.join(project_folder, "queries")

  # Filename with various extensions
  query_filename = File.join(query_folder, query_id)
  query_filename_sql = query_filename + ".sql"
  query_filename_json = query_filename + ".json"

  File.delete query_filename_json if File.exists? query_filename_json
  File.delete query_filename_sql if File.exists? query_filename_sql
end

# Executes a query in the context of a given project. This is of course
# a major security concern and shouldn't be done lightly.
#
# @param project_folder [string] The projects root folder
# @params sql [string] The SQL query
# @param params [Hash] Query parameters
#
# @return [Hash] "Over-the-wire" JSON response
def project_run_query(project_folder, sql, params)
  sqlite_file_path = File.join(project_folder, "db.sqlite")
  db = SQLite3::Database.new(sqlite_file_path)

  toReturn = db.execute(sql, params)
  return toReturn
end

# Executes a query that is part of a certain project
#
# @param project_folder [string] The projects root folder
# @param query_id [string] The id of the query to execute
# @param params [Hash] Query parameters
#
# @return [Hash] "Over-the-wire" JSON response
def project_run_stored_query(project_folder, query_id, params)
  query_folder = File.join(project_folder, "queries")
  query_file = File.join(query_folder, query_id + ".sql")
  query_sql = File.read(query_file)

  return (project_run_query(project_folder, query_sql, params))
end
