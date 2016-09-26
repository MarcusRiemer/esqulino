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
  # @see Query.save_description
  def save!    
    self.save_description
    
    # Is the SQL representation present?
    if not @sql.nil? then
      # Yes, simply store it
      File.open(query_file_path("sql"), "w") do |f|
        f.write(@sql)
      end
    else
      # No, delete a possibly existing sql file.
      File.delete query_file_path "sql" if File.exists? query_file_path "sql"
    end
  end

  # Saves only the description of this query, but leaves the SQL files
  # as they are.
  #
  # This requires the query model to be currently loaded. If it is not loaded
  # an exception is thrown because
  #
  # a) Writing an unloaded query would destroy the previously stored model
  # b) Loading and immediatly saving is effectively a NOOP
  #
  # Or to put in other terms: Saving something that hasn't been loaded smells like
  # something that would never happen on purpose.
  def save_description
    @project.assert_write_access!
    raise EsqulinoError, "Attempted to save unloaded query" if @model.nil?
    
    # Ensuring that the project folder has a "queries" subfolder
    if not File.directory?(@project.folder_queries)
      FileUtils.mkdir_p(@project.folder_queries)
    end

    # Actually write to disk the model to disk, but without the ID as
    # part of the model itself
    filtered_model = @model.dup.tap { |m| m.delete "id" }
    File.open(query_file_path, "w") do |f|
      f.write(JSON.pretty_generate filtered_model)
    end
  end

  # Removes all files that belong to this query. The in-memory representation
  # (this object) is left intact.
  def delete!
    File.delete query_file_path if File.exists? query_file_path
    File.delete query_file_path "sql" if File.exists? query_file_path "sql"
  end

  # Executes this query in the context of the associated project.
  def execute(params)
    # Ensure parameters are supplied
    if not self.executable?(params)
      raise InvalidQueryRequest.new(self, params)
    end
    
    @project.execute_sql(sql, params)
  end

  # @return [Boolean] True, if these params would allow the query to be executed.
  def executable?(params)    
    self.required_parameters.all? {|p| params.include? p}
  end

  # @return The id of this query
  def id
    @id
  end
  
  # @return The user-facing name of this query
  def name
    model['name']
  end

  # @return The version of this query
  def api_version
    model['apiVersion']
  end

  # @return True, if this query should return a single row
  def single_row?
    model['singleRow']
  end

  # @return True, if this query is a SELECT query
  def is_select?
    model.key? "select"
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

  # @return [List<string>] The names of the required parameters
  def required_parameters
    # Grab everything 
    self.expression_leaves
      .select {|c| c.key?('parameter') }
      .map {|c| c['parameter']['key']}    
  end

  # @return [List<Hash>] Models of all expression leaves
  def expression_leaves
    expressions = []

    # Expressions in WHERE
    if self.model['where']
      expressions << self.model['where']['first']
    end

    # Expressions in INSERT
    if self.model['insert']
      expressions.concat(self.model['insert']['assignments'].map{|a| a['expr']})
    end

    find_leaves = lambda do |expr|
      # How or whether to recurse depends on the type
      if expr['binary']
        # Descend to both branches of a binary expression
        return [
          find_leaves.call(expr['binary']['lhs']),
          find_leaves.call(expr['binary']['rhs'])
        ]
      end

      # Find out whether this is a leaf

      # These keys indicate that the current node is a leaf. Beware that these
      # keys are not the template identifiers of the Typescript representation,
      # but the keys of the data model.
      leaves = ['missing', 'constant', 'parameter', 'singleColumn', 'star']

      
      leaf_type = expr.keys.select {|c| leaves.include? c}
      if leaf_type.length == 1 
        # Return those leaves wrapped in a list
        return [expr[leaf_type[0]]]
      else
        return []
      end
    end

    expr_leaves = expressions
                    .map(&find_leaves)
                    .flatten

    return (expr_leaves)
  end
end
