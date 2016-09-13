require 'sinatra/base'
require 'sinatra/config_file'
require 'sinatra/json'
require 'sinatra/multi_route'

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

  # Required to allow some "fancy" subdomain routes to view projects
  register Sinatra::Subdomain

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
    enable :logging

    # No caching
    set :static_cache_control, [:no_cache, :max_age => 0]
  end

  # Preferring our own exceptions
  set :show_exceptions, :after_handler

  # The data directory for this esqulino instance.
  def given_data_dir
    ARGV[1] || "../data/dev/"
  end

  # The directory all projects are served from.
  def projects_dir
    File.join(given_data_dir, "projects")
  end

  # Ensures the @project instance variable, should be called before
  # actual request handling happens.
  #
  # @param project_id The id of the project to load
  def request_prepare_project(project_id)
    @project = Project.new File.join(projects_dir, project_id), false
    @project.write_access = authorized?
  end

  # Ensures the @query instance variable, should be called before
  # actual request handling happens.
  def request_prepare_query(query_id)
    # Only match numeric or missing IDs, everything else may be a valid
    # sub-route like "run"
    if query_id.nil? or is_string_id? query_id then
      @query = Query.new(@project, query_id)
    end
  end

  # Ensures the @page instance variable, should be called before
  # actual request handling happens.
  #
  # @param page_name_or_id [string] Name or ID of the page
  # @param index_valid [boolean] Use index page on empty name or ID
  def request_prepare_page(page_name_or_id, index_valid)
    # Distinguish between index page, page names and ids
    if page_name_or_id.nil? || page_name_or_id.empty? then
      # Is there a matching index page and should we use it?
      if index_valid and @project.index_page? then
        # Yes, we use that
        @page = @project.index_page
      else
        # No, we use an empty page
        @page = Page.new(@project);
      end
    elsif is_string_id? page_name_or_id then
      # Specific ID, this could be a page that does not exist yet
      @page = Page.new(@project, page_name_or_id)
    else
      # User-facing name, this needs to be unescaped to turn
      # things like %20 back into spaces
      page_name = URI.unescape(page_name_or_id)
      @page = @project.page_by_name page_name_or_id
    end
  end

  # Ensure that routes with projects do have projects available.
  before '/api/project/:project_id/?*' do
    request_prepare_project params['project_id']
  end

  # Ensure that routes with queries do have the query available.
  before '/api/project/:project_id/query/:query_id?/?*' do
    request_prepare_query params['query_id']
  end

  # Ensure that routes with pages do have the page available.
  before '/api/project/:id/page/?:page_id?/?*' do
    request_prepare_page(params['page_id'], false)
  end

  # Ensure that viewing pages have all resources available
  before '/view/:project_id/?:page_name_or_id?' do
    request_prepare_project params['project_id']
    request_prepare_page(params['page_name_or_id'], true)
  end

  # React on esqulino errors
  error EsqulinoError do
    exception = env['sinatra.error']

    # Possibly tell the browser that we expect login data
    if exception.code == 401 then
      headers['WWW-Authenticate'] = 'Basic realm="esqulino"'
    end

    status exception.code
    json exception
  end

  # Ensures further progress can only be made by authorized users and triggers
  # a password entry if authorization failed.
  def protected!
    raise AuthorizationError.new unless authorized?
  end

  # Very basic check to see whether a certain user is authorized
  # to do some kind of write on the server.
  def authorized?
    @auth ||= Rack::Auth::Basic::Request.new(request.env)

    begin
      if @auth.provided? and @auth.basic? then
        user, pass = @auth.credentials
        @project.verify_password user, pass
      else
        return false
      end
    rescue AuthorizationError => e
      return false
    end
  end

  # Listing all projects that are available
  get '/api/project' do
    projects = enumerate_projects(projects_dir, false)
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

    result = @project.execute_sql(request_data['sql'], request_data['params'])
    json(result['rows'])
  end

  # Running a query that has already been stored on the server
  post '/api/project/:project_id/query/:query_id/run' do
    query_params = @@validator.ensure_request("QueryParamsDescription", request.body.read)

    result = @query.execute(query_params)
    json(result['rows'])
  end

  # Storing a query
  post '/api/project/:project_id/query/:query_id?' do
    new_query = @@validator.ensure_request("QueryUpdateRequestDescription", request.body.read)

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
  post '/api/project/:project_id/render' do   
    # Ensure this request is shaped as we would expect it
    render_request = @@validator.ensure_request("PageRenderRequestDescription", request.body.read)

    # The known parameters for this request
    params = render_request['params']
    params['get'] = request.GET

    # Queries are Hashes of the form { sql :: string, name :: string }
    queries = render_request['queries']

    page_template = render_request['source']
    render_engine = render_request['sourceType']

    
    # This page is not stored on the server, we construct it in memory
    page = Page.new(@project, nil, render_request['page'])

    # Enrich parameters with query data
    page.render(params, render_engine, page_template)
  end

  # Storing a page
  post '/api/project/:project_id/page/?:page_id?' do
    new_page = @@validator.ensure_request("PageUpdateRequestDescription", request.body.read)

    # Store the new model
    @page.model = new_page['model']
    @page.save!

    # Store all templates
    @page.save_templates new_page['sources']

    return [200, @page.id]
  end

  # Deleting a page
  delete '/api/project/:project_id/page/:page_id' do
    @page.delete!

    # Was this the index page? Then remove it from the description
    @project.check_index_page!
    @project.save_description

    return 200
  end

  # Viewing a specific page
  get '/view/:project_id/?:page_name?' do
    return @page.render({})
  end
  
  # Rendering subdomains
  subdomain do
    # Browsers will automatically ask for the favicon at the root of the URL. Without this
    # route the favicon would be interpreted as a page name or id.
    get '/favicon.ico' do
      status 404
    end

    # Render a page
    get '/:page_name_or_id?' do |page_name_or_id|
      request_prepare_project subdomain
      request_prepare_page(page_name_or_id, true)

      query_params = {
        'get' => request.GET,
      }

      return @page.render(query_params)
    end

    # Run a query
    post '/:page_name_or_id?/query/:query_ref' do |page_name_or_id, query_id|
      request_prepare_project subdomain
      request_prepare_page(page_name_or_id, true)

      # Grab all input values that are not empty and get rid of the "input." prefix
      input_params = {}
      request.POST
        .select {|key,value| key.start_with? "input" and not value.strip.empty?}
        .each {|key,value| input_params[key[6..-1]] = value }

      # Doing the same for hidden "get" inputs
      form_get_params = {}
      request.POST
        .select {|key,value| key.start_with? "get" and not value.strip.empty?}
        .each {|key,value| form_get_params[key[4..-1]] = value }

      # Put them in the "grand" request object
      initial_params = {
        'input' => input_params,
        'get' => form_get_params,
        'project' => @project.render_params
      }

      puts initial_params.inspect
      
      bind_params = {}

      request.GET.each do |parameter_name, providing_name|
        # Extract all relevant indizes
        providing_prefix, providing_name = providing_name.split "."
        
        # And do the actual mapping
        mapped_value = initial_params
                       .fetch(providing_prefix)
                       .fetch(providing_name)
        bind_params[parameter_name] = mapped_value
      end

      # Grab the query reference
      query = @project.query_by_id query_id
      @project.execute_sql(query.sql, bind_params)

      # Go back
      redirect back
    end
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
