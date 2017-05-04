# coding: utf-8

require 'open3'

require 'sinatra/base'
require 'sinatra/config_file'
require 'sinatra/json'
require 'sinatra/multi_route'

require 'yaml'
require 'uri' # To unescape URIs

require './project.rb'
require './schema.rb'
require './schema-graphviz.rb'
require './schema-alter.rb'
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
  set :public_folder, File.dirname(__FILE__) + "/../client/dist"

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
    ARGV[1] || ENV['ESQULINO_DATA_DIR'] || "../data/dev/"
  end

  # The directory all projects are served from.
  def projects_dir
    File.join(given_data_dir, "projects")
  end

  # Information about the server that needs to be available
  # when rendering
  def server_render_data
    return {
      'editor_host' => ENV['ESQULINO_EDITOR_HOST'] || 'localhost.localdomain:9292'
    }
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
    updated_project = @@validator.ensure_request("ProjectDescription", request.body.read)

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

  # Getting entries inside a table
  get '/api/project/:project_id/db/:database_id/rows/:tableName/:from/:amount' do    
    if(@project.has_table(params['tableName']))
      result = @project.execute_sql("Select * from #{params['tableName']} limit ? offset ?", [params['amount'], params['from']])
      json(result['rows'])
    end
  end

  # Getting count of entries inside a table
  get '/api/project/:project_id/db/:database_id/count/:tableName' do
    if(@project.has_table(params['tableName']))
      result = @project.execute_sql("Select Count(*) from #{params['tableName']}", [])
      json(result['rows'].first)
    end
  end

  # Creates a new table in the given database
  post '/api/project/:project_id/db/:database_id/create' do |_p, database_id|
    # TODO: The schema code makes use of OpenStruct, which the validator does
    #       not like. So currently two JSON objects are created, this
    #       is obviously not perfect.
    whole_body = request.body.read

    @@validator.ensure_request("TableDescription", whole_body) # 1st JSON-object
    newTable = createObject(whole_body)                        # 2nd JSON-object
    if(!@project.has_table(newTable['name']))
      error, msg = create_table(@project.file_path_sqlite, newTable)  
      if(error == 0)
        return 200
      else
        return 500, {'Content-Type' => 'application/json'}, {:errorCode => '3', :errorBody => json(msg)}.to_json
      end
    else
      return 400, {'Content-Type' => 'application/json'}, {:errorCode => '3', :errorBody => json("Error: table #{newTable.name} already exists")}.to_json
    end
  end

  # Drops a single table of the given database.
  delete '/api/project/:project_id/db/:database_id/drop/:tableName' do |_p, database_id, tableName|
    if(@project.has_table(params['tableName']))
      error, msg = remove_table(@project.file_path_sqlite, params['tableName'])  
      if(error == 0)
        return 200
      else
        return 500, {'Content-Type' => 'application/json'}, {:errorBody => json(msg)}.to_json
      end
    end
  end

  # Allows to alter tables of a certain database. This route primarily operates on the
  # JSON-payload in the body of the request.
  post '/api/project/:project_id/db/:database_id/alter/:tableName' do
    if(@project.has_table(params['tableName']))
      alter_schema_request = @@validator.ensure_request("AlterSchemaRequestDescription", request.body.read)
      commandHolder = alter_schema_request['commands']
      error, index, errorCode, errorBody = database_alter_schema(@project.file_path_sqlite, params['tableName'], commandHolder)
      if(error) 
        return 500, {'Content-Type' => 'application/json'}, { :index => index.to_s, :errorCode => errorCode.to_s, :errorBody => json(errorBody)}.to_json
      else 
        return 200, {'Content-Type' => 'application/json'}, {:schema => database_describe_schema(@project.file_path_sqlite)}.to_json
      end
    end
  end

  # Delivers visual representations of database schemas
  get '/api/project/:project_id/db/:database_id/visual_schema' do |project_id, database_id|
    # Build the GraphViz description of the database
    db_path = @project.file_path_sqlite_from_id(database_id)
    db_graphviz = database_graphviz_schema(db_path)

    # The default renderer currently is svg:cairo, but
    # the user may override it.
    format = params.fetch('format', 'svg')
    
    # Does the user want to download the file?
    if params.has_key? 'download'
      file_extension = format.split(':').first
      filename = "#{project_id}-db-schema-#{database_id}.#{file_extension}"
      response.headers['Content-Disposition'] = "attachment; filename=\"#{filename}\""
    end

    # Did the user request the internal graphviz format?
    # This is probably only useful to debug stuff, but there
    # seems no harm in handing out the sources.
    if format == 'graphviz'
      content_type :text
      return db_graphviz
    else
      # Invoke graphviz to actually render something
      db_img, err, status = Open3.capture3('dot',"-T#{format}", :stdin_data => db_graphviz)

      # Was the rendering successful?
      if status.exitstatus != 0
        halt 500, {'Content-Type' => 'text/plain'}, err
      else
        # We need some special work for SVG images
        if format.start_with? 'svg'
          # Set matching MIME-type and replace relative paths
          content_type "image/svg+xml"
          db_img.gsub! 'vendor/icons/', '/vendor/icons/'
        else
          # Other images only require a matching MIME-type
          content_type "image/#{format}"
        end
        # Deliver the image itself
        return db_img
      end
    end
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
      begin
        request_prepare_project subdomain
        request_prepare_page(page_name_or_id, true)

        initial_params = {
          'get' => request.GET,
          'server' => self.server_render_data,
          'project' => @project.render_params,
          'page' => @page.render_params,
        }

        return @page.render(initial_params)

      rescue EsqulinoError => e
        initial_params['exception'] = e.to_liquid
        status e.code
        liquid_render_path(@project, "exception", initial_params)
      end
    end

    # Run a query
    post '/:page_name_or_id?/query/:query_ref' do |page_name_or_id, query_id|
      begin
        request_prepare_project subdomain
        request_prepare_page(page_name_or_id, true)

        # Grab all "naked" POST-parameters
        input_params = {}
        request.POST
          .select {|key,value| not key.include? '.' }
          .each {|key,value| input_params[key] = value }

        # Put them in the "grand" request object
        # Doing the same for hidden "get" inputs
        form_get_params = {}
        request.POST
          .select {|key,value| key.start_with? "get" and not value.strip.empty?}
          .each {|key,value| form_get_params[key[4..-1]] = value }

        bind_params = form_get_params.merge(input_params)

        puts "Bind params: #{bind_params}"

        initial_params = {
          'request' => input_params,
          'get' => form_get_params,
          'project' => @project.render_params,
          'page' => @page.render_params,
          'server' => self.server_render_data
        }

        # GET-parameters denote a mapping
        request.GET.each do |parameter_name, providing_name|
          # Does the providing name have a prefix?
          if providing_name.include? '.'
            # Yes, properly split it up to map something
            providing_prefix, providing_name = providing_name.split "."

            # And do the actual mapping
            begin
              mapped_value = initial_params
                               .fetch(providing_prefix)
                               .fetch(providing_name)
              bind_params[parameter_name] = mapped_value
            rescue KeyError => e
              # For the moment we simply let them be,
              # query.executeable? does the real checking of required parameters.
            end
          else
            bind_params[parameter_name] = bind_params[providing_name]
            bind_params.delete providing_name
          end
        end

        # Grab the query reference
        query = @project.query_by_id query_id
        query.execute(bind_params)

        # Go back
        redirect back
      rescue EsqulinoError => e
        initial_params['exception'] = e.to_liquid
        status e.code
        liquid_render_path(@project, "exception", initial_params)
      end
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
