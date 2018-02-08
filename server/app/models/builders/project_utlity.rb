class ProjectUtility

  def initialize(id: project_id)
    @id = project_id
    @base_path = Rails.application.config.sqlino[:projects_dir]
  end

  def generate
    project_directory
    local_database
  end

  def project_path
    full_path = File.join @base_path, @id
    if File.exists? full_path
      raise EsqulinoError.new("Project \"#{id}\" can't be created, it already exists")
    end
  end

  def project_directory
    Dir.mkdir project_path
  end

  def local_database
    if db_type == 'sqlite3'
      # Creating folders and files
      project_database_folder = File.join project_path, 'databases'
      project_database_default_path = File.join project_database_folder, 'default.sqlite'
      Dir.mkdir project_database_folder
      SQLite3::Database.new project_database_default_path
    else
      raise EsqulinoError.new "Unknown database type: \"#{db_type}\" "
    end
  end
end