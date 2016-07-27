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
  def save_model
    raise EsqulinoError, "Attempted to save unloaded page" if @model.nil?

    # Ensuring that the project folder has a "pages" subfolder
    if not File.directory?(@project.folder_pages)
      FileUtils.mkdir_p(@project.folder_pages)
    end

    # Actually write to disk
    File.open(page_file_path, "w") do |f|
      f.write(@model.to_json)
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
    templates.each do |engine_type,template|
      File.open(page_file_path(engine_type), 'w') do |f|
        f.write(template)
      end
    end
  end

  # Removes all files that belong to this query. The in-memory representation
  # (this object) is left intact.
  def delete!
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
    @model['referencedQueries']
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
  def render(params, render_engine = "liquid")    
    # Load all referenced queries
    queries = referenced_queries.map do |ref|
      {
        'name' => ref['name'],
        'sql' => @project.query_by_id(ref['queryId']).sql
      }
    end

    # And execute them, enriching the parameters with query data
    params = @project.execute_page_queries(queries, params)

    # Load the template string
    template = read_template(render_engine)

    # And hand over to do some actual rendering
    project_render_page_template(@project, template, render_engine, params)
  end

  # Read a template specification for this page
  def read_template(extension = ".liquid")
    # Model file must still exist, otherwise the state of this page is inconsistent
    raise UnknownPageError.new(@project.id, @id) unless File.exists? page_file_path
    
    # Template file must exist
    raise UnknownPageError.new(@project.id, @id, extension) unless File.exists? page_file_path extension
    
    File.read(page_file_path extension)
  end

  # Resolvey a query by the name of it's reference
  def get_query_by_reference_name(ref_name)
    ref_index = referenced_queries.find_index {|ref| ref['name'] == ref_name}
    raise UnknownReferenceNameError.new(@project, self, ref_name) if ref_index.nil?

    return @project.query_by_id referenced_queries[ref_index]['queryId']
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
