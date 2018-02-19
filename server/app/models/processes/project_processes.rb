require_dependency 'error'

module Processes
  # This utility class encapsulates processes that revolve around projects.
  class ProjectProcesses
    attr_accessor :project
    
    def initialize(project)
      @project = project
    end

    # Creates the on-disk directory layout to store this project
    def generate!
      create_project_directory
      create_database('sqlite3')
    end

    # Creates the directory layout for the current project
    def create_project_directory
      directory_path = @project.data_directory_path
      raise EsqulinoError.new("Project directory already exist: #{directory_path}") if File.exist? directory_path
      Dir.mkdir directory_path
      Dir.mkdir File.join(directory_path, "databases")
      Dir.mkdir File.join(directory_path, "images")
    end

    # Creates and initializes the database for the current project
    def create_database(db_type)
      if db_type == 'sqlite3'
        # Creating the SQLite database is a single call. This would be much
        # more sophisticated with a system like PostgreSQL or MySQL where
        # we would have to create users and set some priviliges.
        SQLite3::Database.new @project.sqlite_file_path("default")
      else
        raise EsqulinoError.new "Unknown database type: \"#{db_type}\" "
      end
    end

    def delete!
    end    
  end

  # Must be called when a new project is created.
  def self.project_create!(project)
    ProjectProcesses.new(project).generate!
  end

  # Must be called when a project is deleted.
  def self.project_delete!(project)
    ProjectProcesses.new(project).delete!
  end
end
