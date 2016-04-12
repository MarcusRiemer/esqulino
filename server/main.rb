require 'sinatra/base'
require 'sinatra/reloader'
require 'sinatra/config_file'
require 'sinatra/json'
require "sinatra/multi_route"

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

  register Sinatra::MultiRoute
  
  # Activate reloading when developing
  configure :development do
    register Sinatra::Reloader
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
    project_id = params['id']
    project_folder = File.join(given_data_dir, project_id);

    # Ensure this is actually a project directory
    assert_project_dir project_folder
    project = read_project project_folder
    
    json project
  end

  # Updating a specific project
  post '/api/project/:id' do
    project_id = params['id']
    project_folder = File.join(given_data_dir, project_id);

    # Ensure this is actually a project directory
    assert_project_dir project_folder
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

  # Storing a query
  post '/api/project/:id/query/:queryId?' do
    project_id = params['id']
    project_folder = File.join(given_data_dir, project_id)

    # Ensure this is actually a project directory
    assert_project_dir project_folder

    given_query_id = params['queryId']
    
    query_id = project_store_query(project_folder, JSON.parse(request.body.read), given_query_id)

    return (query_id)
  end

  # Deleting a query
  delete '/api/project/:id/query/:queryId' do
    project_id = params['id']
    project_folder = File.join(given_data_dir, project_id)

    # Ensure this is actually a project directory
    assert_project_dir project_folder

    query_id = params['queryId']

    project_delete_query(project_folder, query_id)

    status 200
  end

  # Running an arbitrary query (Dangerous!)
  post '/api/project/:id/query/run' do
    project_id = params['id']
    project_folder = File.join(given_data_dir, project_id)

    # Ensure this is actually a project directory
    assert_project_dir project_folder

    request_data = JSON.parse(request.body.read)
    result = project_run_query(project_folder, request_data.fetch('sql'), request_data.fetch('params'))
    
    json result
  end

  # Running a query that has already been stored on the server
  post '/api/project/:id/query/:queryId/run' do
    project_id = params['id']
    project_folder = File.join(given_data_dir, project_id)

    # Ensure this is actually a project directory
    assert_project_dir project_folder

    query_id = params['queryId']
    query_params = JSON.parse(request.body.read)
    
    result = project_run_stored_query(project_folder, query_id, query_params)
    json result
  end
  
  index_path = File.expand_path('index.html', settings.public_folder)
  
  # Matching the meaningful routes the client knows. This enables navigation
  # even if the user submits a "deep link" to somewhere inside the
  # application.
  get '/', '/front/*', '/editor/*' do
    send_file index_path
  end

  # Catchall for everything that goes wrong
  get '/*' do
    status 404
  end
end

require_relative 'project'

