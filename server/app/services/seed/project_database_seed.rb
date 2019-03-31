module Seed
  class ProjectDatabaseSeed < Base
    SEED_IDENTIFIER = ProjectDatabase
    SEED_DIRECTORY = "databases"

    def copy_database
      return unless File.exist? seed.sqlite_file_path
      Rails.logger.info "Copying database file to #{seed.sqlite_file_path}"
      FileUtils.cp(seed.sqlite_file_path, seed_directory)
    end
  end
end
