require 'sinatra/base'
require 'sinatra/reloader'
require 'sinatra/config_file'
require 'sinatra/json'
require "sinatra/multi_route"

require 'yaml'
require 'uri' # To unescape URIs

require './project.rb'
require './schema.rb'
require './validator.rb'
require './error.rb'


# Mainly parses paramaters and routes calls to apropriate functions.
# Very little real logic should take place in this class.
#
# All routed paths begin with "/api/", as other URLs may be legitemately
# used by the client. These URLs are mapped to the index.html file, which
# *does* cause some trouble with missing resources, as they get redirected
# to the mainpage. To fix this, a list of all valid URLs would be required ...
class ScratchSqlApp < Sinatra::Base
  # Required to catch the various instances of "default" routes that should
  # also map to the index.html
  register Sinatra::MultiRoute

  # Static HTML files are served from here
  set :public_folder, File.dirname(__FILE__) + "/../dist/client/"

  # There is a single validator for the whole esqulino instance.
  # All schemas are currently loaded when the server is started and are
  # cached for the time being. If the schemas change, a server restart
  # is required.
  @@validator = Validator.new(File.dirname(__FILE__) + "/../schema/json")

  # Activate reloading and disable any caching when developing
  configure :development do
    puts "esqulino is running in development mode"
    register Sinatra::Reloader
    enable :logging

    # No caching
    set :static_cache_control, [:no_cache, :max_age => 0]
  end

  # Preferring our own exceptions
  set :show_exceptions, :after_handler

  # The data directory to serve projects from
  def given_data_dir
    ARGV[1] || "../data/dev/"
  end

  # Ensure that routes with projects do have projects available.
  before '/api/project/:project_id/?*' do
    project_id = params['project_id']
    @project = Project.new File.join(given_data_dir, project_id)

    # Ensure this is actually a project directory
    raise UnknownProjectError, project_id unless @project.exists?
  end

  # Ensure that routes with queries do have the query available.
  before '/api/project/:project_id/query/:query_id?/?*' do
    query_id = params['query_id']
    # Only match numeric or missing IDs, everything else may be a valid
    # sub-route like "run"
    if query_id.nil? or is_string_id? query_id then
      @query = Query.new(@project, query_id)
    end
  end

  # Ensure that routes with pages do have the page available.
  before '/api/project/:id/page/:page_id?/?*' do
    page_id = params['page_id']
    # Only match numeric or missing IDs, everything else may be a valid
    # sub-route like "run"
    if page_id.nil? or is_string_id? page_id then
      @page = Page.new(@project, page_id)
    end
  end

  # Ensure that viewing pages have all resources available
  before '/view/:project_id/?:page_name_or_id?' do
    project_id = params['project_id']
    @project = Project.new File.join(given_data_dir, project_id)

    # Ensure this is actually a project directory
    raise UnknownProjectError, project_id if not @project.exists?

    # Ensure that there is actually a page
    page_name_or_id = params['page_name_or_id']

    # Distinguish between index page, page names and ids
    if page_name_or_id.nil? || page_name_or_id.empty? then
      # Index page
      @page = @project.index_page
    elsif is_string_id? page_name_or_id then
      # Specific ID
      @page = @project.page_by_id page_name_or_id
    else
      # User-facing name, this needs to be unescaped to turn
      # things like %20 back into spaces
      page_name = URI.unescape(page_name_or_id)
      @page = @project.page_by_name page_name_or_id
    end
    
    raise UnknownPageError.new(@project.id, @page.id) unless @page.exists?
  end


  # React on esqulino errors
  error EsqulinoError do
    exception = env['sinatra.error']

    status exception.code
    json exception
  end

  # Listing all projects that are available
  get '/api/project' do
    projects = Dir.entries(given_data_dir)
               .select { |entry| entry != '.' and entry != '..' }
               .map { |entry| Project.new File.join(given_data_dir, entry) }
               .map { |project| project.public_description }
    json projects
  end

  # Updating a specific project
  post '/api/project/:project_id' do
    updated_project = @@validator.ensure_request("ProjectListDescription", request.body.read)

    @project.update_description! updated_project
    @project.save_description
    
    status 200
  end


  # All information about a specific project
  get '/api/project/:project_id' do
    json @project
  end

  # Preview image for a specific project
  get '/api/project/:project_id/preview' do
    # Return the preview image if it exists
    image_path = @project.preview_image_path
    if image_path then
      send_file image_path
    else
      halt 404
    end
  end

  # Running an arbitrary query (Dangerous!)
  post '/api/project/:project_id/query/run' do
    request_data = @@validator.ensure_request("ArbitraryQueryRequestDescription", request.body.read)

    begin
      result = @project.execute_sql(request_data['sql'], request_data['params'])
      json(result['rows'])
    rescue SQLite3::SQLException, SQLite3::ConstraintException => e
      status 400
      json({ :message => e })
    end
  end

  # Running a query that has already been stored on the server
  post '/api/project/:project_id/query/:query_id/run' do
    query_params = @@validator.ensure_request("QueryParamsDescription", request.body.read)

    begin
      result = @query.execute(query_params)
      json(result['rows'])
    rescue SQLite3::SQLException, SQLite3::ConstraintException => e
      status 400
      json({ :message => e })
    end
  end

  # Storing a query
  post '/api/project/:project_id/query/:query_id?' do
    new_query = @@validator.ensure_request("QueryUpdateRequestDescription", request.body.read)

    # Are we creating a new query 
    if @query.nil? then

    end
    
    # Update whatever representation is currently loaded. If this is a new query
    # the ID has been autogenerated, otherwise this ist the "old" id which we dont touch.
    @query.model = new_query['model']
    @query.sql = new_query['sql']

    @query.save!

    return [200, @query.id]
  end

  # Deleting a query
  delete '/api/project/:project_id/query/:query_id' do
    @query.delete!
    return 200
  end

  # Rendering an arbitrary page
  post '/api/project/:project_id/page/render' do
    render_request = @@validator.ensure_request("PageRenderRequestDescription", request.body.read)


    params = render_request['params']

    # Queries are Hashes of the form { sql :: string, name :: string }
    queries = render_request['queries']

    # Enrich parameters with query data
    params = @project.execute_page_queries(queries, params)
    
    page_template = render_request['source']
    render_engine = render_request['sourceType']

    project_render_page_template(@project, page_template, render_engine, params)
  end

  # Storing a page
  post '/api/project/:project_id/page/:page_id?' do
    new_page = @@validator.ensure_request("PageUpdateRequestDescription", request.body.read)

    # Store the new model
    @page.model = new_page['model']
    @page.save_model

    # Store all templates
    @page.save_templates new_page['sources']

    return [200, @page.id]
  end

  # Viewing a specific page
  get '/view/:project_id/?:page_name?' do
    return @page.render({})
  end

  # By now I have too often mistakenly attempted to load other assets than
  # HTML files from "user facing" URLs, mostly due to paths that should have
  # been absolute but weren't. This route attempts to catch all these
  # mistakes rather early, so that the show up as a nice 404 error in the
  # browsers debugging tools
  get /^\/(about|editor)\/.*\.(css|js)/ do
    halt 404, "There are no assets in `editor` or `about` routes"
  end

  # Matching the meaningful routes the client knows. This enables navigation
  # even if the user submits a "deep link" to somewhere inside the
  # application.
  index_path = File.expand_path('index.html', settings.public_folder)
  get '/', '/about/?*', '/editor/*' do
    send_file index_path
  end

  # Catchall for everything that goes wrong
  get '/*' do
    halt 404, "Not found"
  end
end

