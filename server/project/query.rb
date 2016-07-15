require 'json'
require 'yaml'
require 'securerandom' # To generate UUIDs
require 'fileutils'    # To create directory trees

# Represents a esqulino query, which must be part of a project.
# Attributes of this class are loaded lazily on demand, so there
# is no harm in creating loads of instances.
class Query
  def initialize(project, id, model = nil, sql = nil)
    @project = project
    # Generate a new random ID if no ID is specified
    @id =  id || SecureRandom.uuid
    @model = model
    @sql = sql
  end

  # @return True, if at least the project folder and a model file exist
  def exists?
    File.directory? @project.folder_queries and File.exists? query_file_path
  end

  # @return A file path to a query related resource
  def query_file_path(extension = "json")
    File.join(@project.folder_queries, "#{@id}.#{extension}")
  end

  # Loads the page model from disk
  def load_model!
    raise UnknownQueryError.new(@project.id, @id) unless File.exists? query_file_path
    
    self.model = YAML.load_file(query_file_path)
  end

  # Retrieves the JSON representation of this query
  def to_json(options)
    # Ensure that the ID is part of the JSON model
    {
      :id => @id
    }.merge(model).to_json(options)
  end

  # Saves the query as a whole, including the SQL representation. If no
  # SQL representation is present it is deleted.  We prefer having no SQL
  # string at all instead of working with an older state of the query.
  #
  # This requires the query model to be currently loaded. If it is not loaded
  # an exception is thrown because
  #
  # a) Writing an unloaded query would destroy the previously stored model
  # b) Loading and immediatly saving is effectively a NOOP
  #
  # Or to put in other terms: Saving something that hasn't been loaded smells like
  # something that would never happen on purpose.
  def save!
    raise EsqulinoError, "Attempted to save unloaded query" if @model.nil?
    
    # Ensuring that the project folder has a "queries" subfolder
    if not File.directory?(@project.folder_queries)
      FileUtils.mkdir_p(@project.folder_queries)
    end

    # Actually write to disk the model to disk, but without the ID as
    # part of the model itself
    filtered_model = @model.dup.tap { |m| m.delete "id" }
    File.open(query_file_path, "w") do |f|
      f.write(filtered_model.to_json)
    end

    # Is the SQL representation present?
    if not @sql.nil? then
      # Yes, simply store it
      File.open(query_file_path("sql"), "w") do |f|
        f.write(query_file_path "sql")
      end
    else
      # No, delete a possibly existing sql file.
      File.delete query_file_path "sql" if File.exists? query_file_path "sql"
    end
  end

  # Removes all files that belong to this query. The in-memory representation
  # (this object) is left intact.
  def delete!
    File.delete query_file_path if File.exists? query_file_path
    File.delete query_file_path "sql" if File.exists? query_file_path "sql"
  end

  # Executes this query in the context of the associated project.
  def execeute(params)
    @project.execute_sql(sql, params)
  end

  # @return The id of this query
  def id
    @id
  end
  
  # @return The user-facing name of this query
  def name
    model['name']
  end

  # @return The whole backing model of this query
  def model
    load_model! if @model.nil?
    @model
  end

  # Setting a new backing model.
  #
  # @param value The new backing model of this query.
  def model=(value)
    @model = value.dup
  end

  # Loads the SQL file associated with this query
  def load_sql!
    # Model file must still exist, otherwise the state of this query is inconsistent
    raise UnknownQueryError.new(@project.id, @id) unless File.exists? query_file_path

    # SQL file must also exist
    raise UnknownQueryError.new(@project.id, @id, "sql") unless File.exists? query_file_path "sql"

    @sql = File.read(query_file_path "sql")
  end

  # @return The SQL representation of this query
  def sql
    load_sql! if @sql.nil?
    @sql
  end

  # @param value The new SQL representation of this query
  def sql=(value)
    @sql = value
  end
end
