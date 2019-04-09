module Seed
  class ProjectDatabaseSeed < Base
    # configuration
    # SEED_IDENTIFER is the class to stored or loaded
    # SEED_DIRECTORY is directory where the data will be stored or loaded
    SEED_IDENTIFIER = ProjectDatabase
    SEED_DIRECTORY = "databases"

    def seed
      @seed_data ||= seed_id.is_a?(seed_name) ? seed_id : seed_name.find_by(id: seed_id)
    end

    # defines copy_database from base class
    # copy the sqlite file from early loaded path to the specific seed
    # this method is called after store_seed is called
    def after_store_seed
      return unless File.exist? seed.sqlite_file_path
      Rails.logger.info "Copying database file to #{seed.sqlite_file_path}"
      FileUtils.cp(seed.sqlite_file_path, seed_directory)
    end

    # TODO: Deal with exceptions that might be thrown here
    def after_load_seed
      Rails.logger.info "Copying database file #{seed.project.data_directory_path}"
      seed_file = File.join seed_directory, "#{seed.id}.yaml"
      sqlite_seed_file = Pathname(seed_file).sub_ext(".sqlite")
      # TODO: Write into temp folder with path from ProjectSeed
      # Seed::ProjectSeed.path_to_data_directory(seed.project_id)
      database_target_folder = File.join seed.project.data_directory_path, SEED_DIRECTORY

      # Executed on tmp-folder
      FileUtils.mkdir_p database_target_folder
      FileUtils.cp(sqlite_seed_file, database_target_folder)
    end
  end
end
