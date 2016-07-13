require 'json'
require 'yaml'
require 'securerandom' # To generate UUIDs
require 'fileutils'    # To create directory trees

# Throws an exception if the given query does not exist.
#
# @param project_folder [string] The projects root folder
# @param project_id [string] The ID of the project
# @param query_id [string] The ID of the query
def assert_query(project_folder, project_id, query_id)
  query_folder = File.join(project_folder, "queries")

  if not File.exists? File.join(query_folder, query_id + ".json")
    raise UnknownQueryError.new(project_id, query_id)
  end
end

# Allows iteration over all queries that are stored on disk
#
# @param project_folder [string] The projects root folder
def all_queries(project_folder)
  page_folder = File.join(project_folder, "queries")
  Dir.glob(page_folder + "/*.json")
end

# Retrieves all queries that are part of the given project.
#
# @param project_folder [string] The projects root folder
#
# @return [List] A list of "over the wire" descriptions of queries
def project_load_queries(project_folder)
  all_queries(project_folder).map do |query_file|
    project_load_query(project_folder, query_file)
  end
end

# Loads a single query model with a known ID.
#
# @param project_folder [string] The projects root folder
# @param query_ref [string] The id of the page or the
#                           path to the whole file.
#
# @return [Hash] All properties of a page
def project_load_query(project_folder, query_ref)
  # Distinguish between paths and Ids
  if File.exists? query_ref then
    query_id = File.basename(query_ref, ".json")
    query_file = query_ref
  elsif is_string_id? query_ref then
    query_id = query_ref
    query_folder = File.join(project_folder, "queries")
    query_file = File.join(query_folder, "#{query_id}.json")
  else
    raise UnknownPageError.new(query_ref)
  end

  # Load the model from disk
  query_model = YAML.load_file(query_file)

  # Put the id into the model, which is part of the filename
  query_model['id'] = query_id

  return query_model
end

# Loads the SQL representation of single query with a known ID.
#
# @param project_folder [string] The projects root folder
# @param query_ref [string] The id of the page or the
#                           path to the whole file.
#
# @return [Hash] All properties of a page
def project_load_sql(project_folder, query_ref)
  # Distinguish between paths and Ids
  if File.exists? query_ref then
    query_id = File.basename(query_ref, ".sql")
    query_file = query_ref
  elsif is_string_id? query_ref then
    query_id = query_ref
    query_folder = File.join(project_folder, "queries")
    query_file = File.join(query_folder, "#{query_id}.sql")
  else
    raise UnknownPageError.new(query_ref)
  end

  return (File.read query_file)
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

  # Possibly generate a new query id
  query_id = given_query_id || SecureRandom.uuid
  
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
# @param sql [string] The SQL query
# @param params [Hash] Query parameters
#
# @return [Hash] { columns :: List, rows :: List of List }
#                
def project_run_query(project_folder, sql, params)
  sqlite_file_path = File.join(project_folder, "db.sqlite")
  db = SQLite3::Database.new(sqlite_file_path)

  # execute2 returns the names of the columns in the first row
  result = db.execute2(sql, params)
  return {
    'columns' => result.first,
    'rows' => result.drop(1)
  }
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
