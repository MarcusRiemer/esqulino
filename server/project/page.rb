require_relative './query.rb'

# Represents a esqulino page, which must be part of a project.
# Attributes of this class are loaded lazily on demand, so there
# is no harm in creating loads of instances.
class Page

  def initialize(project, id, model = nil)
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
    Dir.glob(File.join(@project.folder_pages, "#{@id}.*"))
  end

  # Loads the page model from disk
  def load_model!
    raise UnknownPageError.new(@project.id, @id) unless File.exists? page_file_path
    
    @model = YAML.load_file(page_file_path)
    @model['id'] = @id
  end

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
    
    page_folder = File.join(@project.folder, "pages")

    # Ensuring that the project folder has a "pages" subfolder
    if not File.directory?(page_folder)
      FileUtils.mkdir_p(page_folder)
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

  # @return The id of this page
  def id
    model['id']
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
    @model = value
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
    load_model!
    
    # Load all referenced queries
    queries = @model['referencedQueries'].map do |ref|
      {
        'name' => ref['name'],
        'sql' => project_load_sql(@project.folder, ref['queryId'])
      }
    end

    # And execute them
    params = project_execute_page_queries(@project.folder, queries, params)

    # Load the template string
    template = read_template(render_engine)

    # And hand over to do some actual rendering
    project_render_page_template(@project.folder, template, render_engine, params)
  end

  # Read a template specification for this page
  def read_template(extension = ".liquid")
    # Todo: Work with more than one template engine
    raise EsqulinoError.new("Unknown template type \"#{extension}\"") if extension != "liquid"

    File.read(page_file_path "liquid")
  end
end

# Run all given queries and transform the output to be useful
# for Liquid-template bindings.
#
# @param project_folder [string] The projects root folder
# @param queries [Hash] { name :: string, sql :: string }
#                       A named SQL query
# @param params [Hash] Parameters that are known before the
#                      query was executed. These can work as
#                      input for the queries and are returned
#                      enriched with the query data.
def project_execute_page_queries(project_folder, queries, params)
  # Hashes are passed by reference and we don't want to destroy
  # anything on the callsite
  params = params.dup
  
  queries.each do |query|
    # Ensure every query is fully defined
    name = query.fetch('name')
    sql = query.fetch('sql')

    # Run the query
    result = project_run_query(project_folder, sql, {})

    # Liquid works much better with 'sensible' keys as names, so we
    # map the column names into each row. This basically transforms
    # rows like [1,2,3] to { "column-name-1" => 1, ... }
    mapped = result['rows'].map { |r| Hash[result['columns'].zip r] }

    # Rows with a single value allow a short-hand notation. The user
    # shouldn't be forced to write {{ row[0].column }} every time he
    # **knows** there is only a single row.
    mapped = mapped.first if mapped.length == 1

    # Store the 
    params[name] = mapped
  end

  return (params)
end


# The actual rendering of a page with all of it's queries and other
# data. Absolutly no disk IO takes place in this method, everything
# has been fetched from disk already.
#
# @param project_folder [string] The projects root folder
# @param page_template [string] A renderable version of the page
# @param render_engine The render engine to use
# @param params [Hash] All arguments that are required to render this page
#
# @return [string] The rendered HTML representation of the page
def project_render_page_template(project,
                                 page_template,
                                 render_engine,
                                 params)
  # Setting up load paths
  
  
  # Load the basic liquid template
  template = Liquid::Template::parse(page_template)

  # Render it alongside the known parameters
  return (template.render(params))
end
