require 'sinatra/base'
require 'sinatra/reloader'
require 'sinatra/config_file'
require 'sinatra/json'

require 'yaml'

require './project.rb'

class ScratchSqlApp < Sinatra::Base
  enable :logging
  
  # Activate reloading when developing
  configure :development do
    #register Sinatra::Reloader
  end

  # Static HTML files are served from here
  set :public_folder, File.dirname(__FILE__) + "/../dist/client/"

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
    project = YAML.load_file(File.join(project_folder, "config.yaml"));
    project = project_public_info(project);
    
    # Put the schema into it
    project['schema'] = database_describe_schema(project_folder)

    # Load all related queries
    project['queries'] = project_load_queries(project_folder)
    
    json project
  end

  # Preview image for a specific project
  get '/api/project/:id/preview' do
    # Load the project to find out whether a preview image is set
    project_id = params['id']
    project_path = File.join(given_data_dir, project_id)
    project = YAML.load_file(File.join(project_path, "config.yaml"));

    # Return the preview image if it exists
    if project.key?("preview") then
      send_file File.expand_path(project["preview"], project_path)
    else
      halt 404
    end
    
  end

  # Updating a query
  post '/api/project/:id/query/:queryId' do

  end

  # Catchall for the rest of routes. This enables meaningful navigation
  # even if the user submits a "deep link" to somewhere inside the
  # application.
  get '/*' do
    send_file File.expand_path('index.html', settings.public_folder)
  end
end

require_relative 'project'

