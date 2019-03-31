module Seed
  class ProjectDatabaseSeed < Base
    # configuration
    # SEED_IDENTIFER is the class to stored or loaded
    # SEED_DIRECTORY is directory where the data will be stored or loaded
    SEED_IDENTIFIER = ProjectDatabase
    SEED_DIRECTORY = "databases"

    # defines copy_database from base class
    # copy the sqlite file from early loaded path to the specific seed
    def copy_database
      return unless File.exist? seed.sqlite_file_path
      Rails.logger.info "Copying database file to #{seed.sqlite_file_path}"
      FileUtils.cp(seed.sqlite_file_path, seed_directory)
    end
  end
end
