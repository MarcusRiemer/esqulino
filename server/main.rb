require 'sinatra/base'
require 'sinatra/reloader'
require 'sinatra/config_file'
require 'sinatra/json'

require 'yaml'

require './project.rb'

# Mainly parses paramaters and routes calls to apropriate functions.
# Very little real logic should take place in this class.
#
# All routed paths begin with "/api/", as other URLs may be legitemately
# used by the client. These URLs are mapped to the index.html file, which
# *does* cause some trouble with missing resources, as they get redirected
# to the mainpage. To fix this, a list of all valid URLs would be required ...
class ScratchSqlApp < Sinatra::Base
  enable :logging
  
  # Activate reloading when developing
  configure :development do
    #register Sinatra::Reloader
  end

  # Static HTML files are served from here
  set :public_folder, File.dirname(__FILE__) + "/../dist/client/"

  # The data directory to serve projects from
  def given_data_dir
    ARGV[1] || "../data/dev/"
  end
  
  # Listing all projects that are available
  get '/api/project' do
    projects = Dir.entries(given_data_dir)
               .select { |entry| !(entry =='.' || entry == '..') }
               .map { |entry| YAML.load_file(File.join(given_data_dir, entry, "config.yaml")) }
               .map { |entry| project_public_info entry }
    

    json projects
  end

  # Info about a specific project
  get '/api/project/:id' do
    # Load data from disk and strip any private data
    project_id = params['id']
    project_folder = File.join(given_data_dir, project_id);

    # Ensure this is actually a project directory
    assert_project_dir project_folder
    
    project = YAML.load_file(File.join(project_folder, "config.yaml"));
    project = project_public_info(project);
    
    # Put the schema into it
    project['schema'] = database_describe_schema(project_folder)

    # Load all related queries
    project['queries'] = project_load_queries(project_folder)

    content_type :json
    
    json project
  end

  # Preview image for a specific project
  get '/api/project/:id/preview' do
    # Load the project to find out whether a preview image is set
    project_id = params['id']
    project_folder = File.join(given_data_dir, project_id)

    # Ensure this is actually a project directory
    assert_project_dir project_folder
    
    project = YAML.load_file(File.join(project_folder, "config.yaml"));

    # Return the preview image if it exists
    if project.key?("preview") then
      send_file File.expand_path(project["preview"], project_folder)
    else
      halt 404
    end
    
  end

  # Creating a query
  post '/api/project/:id/query/create/:table' do
    project_id = params['id']
    project_folder = File.join(given_data_dir, project_id)

    # Ensure this is actually a project directory
    assert_project_dir project_folder

    query = project_create_query(project_folder, params['table'])
    project_store_query(project_folder, query)

    # Return the ID of the newly created query
    return (query["model"]["id"]);
  end
  
  # Updating a query
  post '/api/project/:id/query/:queryId' do
    project_id = params['id']
    project_folder = File.join(given_data_dir, project_id)

    # Ensure this is actually a project directory
    assert_project_dir project_folder
    
    status project_store_query(project_folder, JSON.parse(request.body.read))
  end

  # Running a query
  post '/api/project/:id/query/:queryId/run' do
    project_id = params['id']
    project_folder = File.join(given_data_dir, project_id)

    # Ensure this is actually a project directory
    assert_project_dir project_folder

    query_id = params['queryId']
    query_params = JSON.parse(request.body.read)
    
    result = project_run_query(project_folder, query_id, query_params)
    status 200
    json result
  end

  index_path = File.expand_path('index.html', settings.public_folder)
  
  # Catchall for the rest of routes. This enables meaningful navigation
  # even if the user submits a "deep link" to somewhere inside the
  # application.
  get '/*' do
    send_file index_path
  end
end

require_relative 'project'

