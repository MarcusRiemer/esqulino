module Builders

  # This Utility class is responsible to create project deirectory and sqlite databse for the project
  class ProjectUtility
    
    def initialize(id:, db_type:)
      @id = id
      @db = db_type
    end

    def generate
      create_project_directory
      create_database
    end

    def project_path
      begin
        base_path = Rails.application.config.sqlino[:projects_dir]
        full_path = File.join(base_path, @id)
      rescue => e
        raise EsqulinoError.new("Project directory already exist: #{e}") if File.exist? full_path
      end
      
      
    end

    def create_project_directory
      Dir.mkdir project_path
    end

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
  end
end