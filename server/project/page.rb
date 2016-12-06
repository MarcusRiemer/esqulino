require_relative './query'
require_relative './liquid'

# Represents a esqulino page, which must be part of a project.
# Attributes of this class are loaded lazily on demand, so there
# is no harm in creating loads of instances.
class Page

  def initialize(project, id = nil, model = nil)
    @project = project
    # Generate a new random ID if no ID is specified
    @id =  id || SecureRandom.uuid
    @model = model
  end

  # @return True, if at least the project folder and a model file exist
  def exists?
    File.directory? @project.folder_pages and File.exists? page_file_path
  end

  # @return A file path to a page related resource
  def page_file_path(extension = "json")
    File.join(@project.folder_pages, "#{@id}.#{extension}")
  end

  # @return Paths to all files that are associated with this page
  def page_files
    glob_string = File.join(@project.folder_pages, "#{@id}.*")
    Dir.glob glob_string
  end

  # Loads the page model from disk
  def load_model!
    raise UnknownPageError.new(@project.id, @id) unless exists?
    
    @model = YAML.load_file(page_file_path)
    @model['id'] = @id
  end
  
  # Retrieves the JSON representation of this page
  def to_json(options)
    # The JSON representation is always meant to be complete
    load_model!
    @model.to_json(options)
  end

  # Saves the abstract representation of this page but deletes every saved
  # template that was stored alongside the model. We prefer having
  # no template representation at all instead of silently working
  # with an older state of the page.
  #
  # This requires the page to be currently
  # loaded. If it is not loaded an exception is thrown because
  #
  # a) Writing an unloaded page would destroy the previously stored model
  # b) Loading and immediatly saving is effectively a NOOP
  #
  # Or to put in other terms: Saving something that hasn't been loaded smells like
  # something that would never happen on purpose.
  def save!
    @project.assert_write_access!
    
    raise EsqulinoError, "Attempted to save unloaded page" if @model.nil?

    # Ensuring that the project folder has a "pages" subfolder
    if not File.directory?(@project.folder_pages)
      FileUtils.mkdir_p(@project.folder_pages)
    end

    # Actually write to disk the model to disk, but without the ID as
    # part of the model itself
    filtered_model = @model.dup.tap { |m| m.delete "id" }

    File.open(page_file_path, "w") do |f|
      f.write(JSON.pretty_generate filtered_model)
    end

    # Deleting everything that is not the model
    page_files do |page_template|
      File.delete page_template unless File.extname(page_template) == '.json'
    end
  end

  # Saves all templates that are part of the given hash. The key is expected
  # to be an identifier for the rendering engine, the value is the template
  # itself.
  #
  # @param templates [Hash] Templates with associated rendering engine
  def save_templates(templates)
    @project.assert_write_access!
    
    templates.each do |engine_type,template|
      File.open(page_file_path(engine_type), 'w') do |f|
        f.write(template)
      end
    end
  end

  # Removes all files that belong to this query. The in-memory representation
  # (this object) is left intact.
  def delete!
    @project.assert_write_access!
    
    page_files.each do |page_file|
      File.delete page_file 
    end
  end

  # @return The id of this page
  def id
    @id
  end
  
  # @return The user-facing name of this page
  def name
    model['name']
  end

  # @return The API version of this page
  def api_version
    model['apiVersion']
  end

  # @return The whole backing model of this page
  def model
    load_model! if @model.nil?
    @model
  end

  # @param value The new backing model of this page
  def model=(value)
    @model = value.dup
    @model.delete "id"
  end

  # @return The queries that are referenced by this page.
  def referenced_queries
    load_model! if @model.nil?
    @model.fetch('referencedQueries', [])
  end

  # Render this page. This will read quite a few things from disk:
  #
  # * The page model to find all referenced queries
  # * Each query that has been mentioned
  # * The template file matching the render engine
  #
  # Then all referenced queries will be executed, this will also involve quite
  # a bit of disk I/O.
  #
  # And finally all parameters, including the query result, will be handed off
  # to the template engine. The result of this render process is then returned.
  def render(params, render_engine = "liquid", template_string = nil)

    params['page'] = self.render_params
    params['project'] = @project.render_params
    
    # Stores the results of executed queries
    result_queries = {}

    # Taking a look at each referenced query
    referenced_queries.each do |ref|
      query = @project.query_by_id(ref['queryId'])

      # Skip queries that are not select queries
      next unless query.is_select?

      # Execute the query and store the result in a hash under the query name
      result = self.execute_referenced_query(ref, params)
      result_queries[ref['name']] = result
    end

    puts "Rendering #{name}, query results: #{result_queries.inspect}"

    # Prepare parameters for rendering, this is basically the union of all
    # previous parameters with the newly created query parameters
    render_params = params.dup
    render_params['query'] = result_queries

    # Load the template string
    if template_string.nil? then
      template_string = self.read_template(render_engine)
    end

    # And hand over to do some actual rendering
    project_render_page_template(@project, template_string, render_engine, render_params)
  end

  # The render parameters that are relevant to this page.
  #
  # @return [Hash] Key-Value pairs that are available specifically on this page.
  def render_params()
    return {
      'name' => self.name,
      'id' => self.id
    }
  end

  # Execute a single query, translating the required parameters
  #
  # @param queryRef [Hash] A query reference
  # @param initial_params [Hash] The initial set of parameters,
  #                              probably mainly input and get
  def execute_referenced_query(query_ref, initial_params)    
    # Each query gets its own fresh set of parameters
    params = {}

    # Not-quite-so-wellformed models may omit the mapping, this
    # shouldn't crash anything immediatly.
    query_ref.fetch('mapping', {}).each do |mapping|
      # But if there is a mapping defined, it must be well formed
      if not mapping.key?('providingName') or not mapping.key('parameterName')
        raise InvalidMappingError.new(@project, self, query_ref)
      end
      

      # Extract all relevant indizes
      providing_prefix, providing_name = mapping.fetch('providingName').split "."
      parameter_name = mapping.fetch('parameterName')
      
      # And do the actual mapping
      mapped_value = initial_params
                     .fetch(providing_prefix)
                     .fetch(providing_name)
      params[parameter_name] = mapped_value
    end

    # Grab the actual query and execute it with the freshly constructed parameters
    query = @project.query_by_id(query_ref['queryId'])
    result = @project.execute_sql(query.sql, params)

    # Prepare result for SELECT queries
    
    # Templating engines works much better with 'sensible' keys as names,
    # so we map the column names into each row. This basically transforms
    # rows like [1,2,3] to { "column-name-1" => 1, ... }
    mapped = result['rows'].map { |r| Hash[result['columns'].zip r] }

    # Rows with a single value allow a short-hand notation. The user
    # shouldn't be forced to write {{ row[0].column }} every time he
    # **knows** there is only a single row.
    if query.single_row?
      if mapped.length == 1
        mapped = mapped.first
      else
        err_msg = "Got #{mapped.length} rows, expected exactly 1"
        raise DatabaseQueryError.new(@project, query.sql, params, err_msg)
      end
    end
    
    return (mapped);
  end

  # Read a template specification for this page
  def read_template(extension = ".liquid")
    # Model file must still exist, otherwise the state of this page is inconsistent
    raise UnknownPageError.new(@project.id, @id) unless File.exists? page_file_path
    
    # Template file must exist
    raise UnknownPageError.new(@project.id, @id, extension) unless File.exists? page_file_path extension
    
    File.read(page_file_path extension)
  end

  # Getting hold of a specific query reference
  def get_query_reference_by_name(ref_name)
    ref_index = referenced_queries.find_index {|ref| ref['name'] == ref_name}
    raise UnknownReferenceNameError.new(@project, self, ref_name) if ref_index.nil?

    return referenced_queries[ref_index]
  end
end

# The actual rendering of a page with all of it's queries and other
# data. Absolutly no disk IO takes place in this method, everything
# has been fetched from disk already.
#
# @param project [string] The project the page belongs to
# @param page_template [string] A renderable version of the page
# @param render_engine The render engine to use
# @param params [Hash] All arguments that are required to render this page
#
# @return [string] The rendered HTML representation of the page
def project_render_page_template(project,
                                 page_template,
                                 render_engine,
                                 params)
  # Todo: Work with more than one template engine
  raise EsqulinoError.new("Unknown template type \"#{render_engine}\"") if render_engine != "liquid"

  liquid_render_page(project, page_template, params)
end
