module Seed
  class ProjectDatabaseSeed < Base
    # configuration
    # SEED_IDENTIFER is the class to stored or loaded
    # SEED_DIRECTORY is directory where the data will be stored or loaded
    SEED_IDENTIFIER = ProjectDatabase
    SEED_DIRECTORY = "databases"

    # defines copy_database from base class
    # copy the sqlite file from early loaded path to the specific seed
    # this method is called after store_seed is called
    def after_store_seed
      return unless File.exist? seed.sqlite_file_path

      info "Copying database file to #{seed.sqlite_file_path}"
      FileUtils.cp(seed.sqlite_file_path, seed_directory)
    end

    # store sqlite from databases path to a tmp direcotry after laoding is finished
    def after_load_seed
      seed_file = File.join seed_directory, "#{seed.id}.yaml"
      sqlite_seed_file = Pathname(seed_file).sub_ext(".sqlite")

      tmp_directory = Seed::ProjectSeed.path_to_data_directory(seed.project_id) + "_tmp"
      database_target_folder = File.join tmp_directory, SEED_DIRECTORY

      FileUtils.mkdir_p database_target_folder

      info "Copying database file from #{sqlite_seed_file}"
      FileUtils.cp(sqlite_seed_file, database_target_folder)
    end
  end
end
