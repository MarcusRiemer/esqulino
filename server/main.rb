require 'sinatra/base'
require 'sinatra/reloader'
require 'sinatra/config_file'
require 'sinatra/json'
require "sinatra/multi_route"

require 'yaml'

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
  enable :logging

  register Sinatra::MultiRoute

  # Static HTML files are served from here
  set :public_folder, File.dirname(__FILE__) + "/../dist/client/"

  # There is a single validator for the whole esqulino instance
  @@validator = Validator.new(File.dirname(__FILE__) + "/../schema/json")
  
  # Activate reloading and disable any caching when developing
  configure :development do
    puts "esqulino is running in development mode"
    register Sinatra::Reloader

    # No caching
    set :static_cache_control, [:no_cache, :max_age => 0]
    # Preferring our own exceptions
    set :show_exceptions, :after_handler
  end

  # The data directory to serve projects from
  def given_data_dir
    ARGV[1] || "../data/dev/"
  end

  # Ensure that routes with projects do have projects available.
  before '/api/project/:id/?*' do
    @project_id = params['id']
    @project_folder = File.join(given_data_dir, @project_id)

    # Ensure this is actually a project directory
    assert_project_dir @project_folder, @project_id
  end

  # Ensure that routes with queries do have the query available.
  before '/api/project/:id/query/:queryId/?*' do
    # Only match numeric IDs, everything else may be a valid
    # sub-route like "run"
    if /\d+.*/ =~ params['queryId'] then
      @query_id = params['queryId']
      
      assert_query @project_folder, @project_id, @query_id
    end
  end

  # Ensure that routes with pages do have the page available.
  before '/api/project/:id/page/:pageId/?*' do
    # Only match numeric IDs, everything else may be a valid
    # sub-route like "run"
    if /\d+.*/ =~ params['pageId'] then
      @page_id = params['pageId']
      
      assert_page @project_folder, @project_id, @page_id
    end
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
               .select { |entry| !(entry =='.' || entry == '..') }
               .map { |entry| YAML.load_file(File.join(given_data_dir, entry, "config.yaml")) }
               .map { |entry| project_public_info entry }
    json projects
  end

  # Updating a specific project
  post '/api/project/:id' do
    updated_project = @@validator.ensure_request("ProjectListDescription", request.body.read)

    update_project_description(@project_folder, updated_project)
    status 200
  end
  

  # Info about a specific project
  get '/api/project/:id' do 
    project = read_project @project_folder
    
    json project
  end

  # Preview image for a specific project
  get '/api/project/:id/preview' do    
    project = YAML.load_file(File.join(@project_folder, "config.yaml"));

    # Return the preview image if it exists
    if project.key?("preview") then
      send_file File.expand_path(project["preview"], @project_folder)
    else
      halt 404
    end
  end

  # Running an arbitrary query (Dangerous!)
  post '/api/project/:id/query/run' do
    request_data = @@validator.ensure_request("ArbitraryQueryRequestDescription", request.body.read)

    begin
      result = project_run_query(@project_folder, request_data.fetch('sql'), request_data.fetch('params'))
      json result
    rescue SQLite3::SQLException, SQLite3::ConstraintException => e
      status 400
      json({ :message => e })
    end
  end

  # Running a query that has already been stored on the server
  post '/api/project/:id/query/:queryId/run' do
    query_params = @@validator.ensure_request("QueryParamsDescription", request.body.read)

    begin
      result = project_run_stored_query(@project_folder, @query_id, query_params)
      json result
    rescue SQLite3::SQLException, SQLite3::ConstraintException => e
      status 400
      json({ :message => e })
    end
  end

  # Storing a query
  post '/api/project/:id/query/:queryId?' do
    new_query = @@validator.ensure_request("QueryUpdateRequestDescription", request.body.read)
    query_id = project_store_query(@project_folder, new_query, @query_id)

    return [200, query_id]
  end

  # Deleting a query
  delete '/api/project/:id/query/:queryId' do
    query_id = params['queryId']

    project_delete_query(@project_folder, query_id)

    return 200
  end

  # Rendering an arbitrary page
  post '/api/project/:id/page/render' do
    render_request = @@validator.ensure_request("PageRenderRequestDescription", request.body.read)
    
    
    return [200, render_request['source']]
  end
  
  # Storing a page
  post '/api/project/:id/page/:pageId?' do
    new_page = @@validator.ensure_request("PageUpdateRequestDescription", request.body.read)
    page_id = project_store_page(@project_folder, new_page, @page_id)
    
    return [200, page_id]
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

require_relative 'project'

