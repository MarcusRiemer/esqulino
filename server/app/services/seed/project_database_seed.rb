module Seed
  class ProjectDatabaseSeed < Base
    SEED_IDENTIFIER = ProjectDatabase
    SEED_DIRECTORY = "databases"

    def store_seed
      FileUtils.mkdir_p seed_directory
      File.open(seed_file_path, "w") do |file|
        YAML::dump(seed, file)
      end
      Rails.logger.info "Copying database file"
      FileUtils.cp(seed.sqlite_file_path, seed_directory)
    end
  end
end
