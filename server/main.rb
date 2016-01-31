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
    register Sinatra::Reloader
  end

  # Static HTML files are served from here
  set :public_folder, File.dirname(__FILE__) + "/../client"

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
    project = YAML.load_file(File.join(given_data_dir, project_id, "config.yaml"));

    json project_public_info(project)
  end

  # Info about a specific schema
  get '/api/project/:name/schema.json' do |name|
    sqlite_path = File.join(given_data_dir, name, "db.sqlite")
    json database_describe_schema(sqlite_path)
  end

  # Catchall for the rest of routes
  get '/*' do
    send_file File.expand_path('index.html', settings.public_folder)
  end
end

require_relative 'project'

