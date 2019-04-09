module Seed
  class ProjectSeed < Base
    # configuration
    # SEED_IDENTIFER is the class to stored or loaded
    # SEED_DIRECTORY is directory where the data will be stored or loaded
    SEED_IDENTIFIER = Project
    SEED_DIRECTORY = "projects"

    # takes an optional arguments dependencies as hash with key as the Model and value as the directory
    def initialize(seed_id)
      super(seed_id, dependencies = {
        ProjectUsesBlockLanguageSeed => "project_uses_block_languages",
        CodeResourceSeed => "code_resources",
        ProjectSourceSeed => "project_sources",
        ProjectDatabaseSeed => "project_databases",
        ProjectDatabaseSeed => "default_database",
      }, defer_referential_checks = true)
    end

    # define base's abstract class to copy images of the project in project directory with under the project file
    # this method is called after store_seed is called
    def after_store_seed
      if File.directory? seed.images_directory_path
        puts "Storing images"
        FileUtils.copy_entry(seed.images_directory_path, seed_specific_directory)
      end
    end

    # TODO: Hook to run after all dependencies have been loaded
    # FileUtils.mv path_to_data_directory(seed.id) seed.data_directory_path
  end
end
