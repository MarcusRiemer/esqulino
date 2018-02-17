require_dependency 'error'

module Builders
  # This Utility class is responsible to create project deirectory and sqlite databse for the project
  class ProjectUtility
    
    def initialize(id:, db_type:)
      @id = id
      @db = db_type
    end

    # Creates the on-disk directory layout to store this project
    def generate!
      create_project_directory
      create_database
    end

    # Calculates the path the current project should be created at
    def project_path
      base_path = Rails.application.config.sqlino[:projects_dir]
      File.join(base_path, @id)
    end

    # Creates the directory for the current project
    def create_project_directory
      raise EsqulinoError.new("Project directory already exist: #{project_path}") if File.exist? project_path
      Dir.mkdir project_path
    end

    # Creates and initializes the database for the current project
    def create_database
      if @db == 'sqlite3'
        # Creating folders and files
        project_database_folder = File.join project_path, 'databases'
        project_database_default_path = File.join project_database_folder, 'default.sqlite'
        Dir.mkdir project_database_folder
        SQLite3::Database.new project_database_default_path
      else
        raise EsqulinoError.new "Unknown database type: \"#{db}\" "
      end
    end

    def delete!
    end
    
  end
end
