require 'sinatra/base'
require 'sinatra/reloader'
require 'sinatra/config_file'
require 'sinatra/json'

require 'yaml'

class ScratchSqlApp < Sinatra::Base
  enable :logging
  
  # Activate reloading when developing
  configure :development do
    register Sinatra::Reloader
  end

  # Static HTML files are served from here
  set :public_folder, File.dirname(__FILE__) + "/../client"

  # Listing all projects that are available
  get '/project' do
    given_data_dir = ARGV[1] || "../data/dev/"
    project_dirs = Dir.entries(given_data_dir)
                   .select { |entry| !(entry =='.' || entry == '..') }
                   .map { |entry| YAML.load_file(File.join(given_data_dir, entry, "config.yaml")) }
    

    json project_dirs
  end

  get '/' do
    send_file File.expand_path('index.html', settings.public_folder)
  end
end

require_relative 'project'

