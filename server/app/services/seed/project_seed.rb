module Seed
  class ProjectSeed < Base
    # configuration
    # SEED_IDENTIFER is the class to stored or loaded
    # SEED_DIRECTORY is directory where the data will be stored or loaded
    # IMAGE_DIRECTORY is the image directory for the data storage
    SEED_IDENTIFIER = Project
    SEED_DIRECTORY = "projects"
    IMAGE_DIRECTORY = "images"
    # PATH_TO_DATA_DIRECTORY = File.join(Rails.application.config.sqlino[:projects_dir], loaded_seed.id)
    # takes an optional arguments dependencies as hash with key as the Model and value as the directory
    def initialize(seed_id)
      super(seed_id, dependencies = {
        "project_uses_block_languages" => ProjectUsesBlockLanguageSeed,
        "code_resources" => CodeResourceSeed,
        "project_sources" => ProjectSourceSeed,
        "project_databases" => ProjectDatabaseSeed,
        "default_database" => ProjectDatabaseSeed,
      }, defer_referential_checks = true)
    end

    # define base's abstract class to copy images of the project in project directory with under the project file
    # this method is called after store_seed is called
    def after_store_seed
      if File.directory? seed.images_directory_path
        Rails.logger.info "Storing images"
        FileUtils.copy_entry(seed.images_directory_path, seed_specific_directory)
      end
    end

    # store image from proejct path into a tmp directory after loading
    def after_load_seed
      if File.directory? seed_specific_directory
        info "COPY Images"

        tmp_directory = path_to_data_directory + "_tmp"
        FileUtils.mkdir_p tmp_directory
        image_target_folder = File.join tmp_directory, IMAGE_DIRECTORY
        FileUtils.copy_entry seed_specific_directory, image_target_folder
      end
    end

    # move the tmp directory to the main data directory after laoding process is finished
    def move_data_from_tmp_to_data_directory
      FileUtils.remove_dir(path_to_data_directory)
      FileUtils.mv path_to_data_directory + "_tmp", path_to_data_directory
    end

    # make static method availbale as instance method for this class
    def path_to_data_directory
      self.class.path_to_data_directory(loaded_seed.id)
    end

    # this static method is part of this class and should be available to outside
    def self.path_to_data_directory(id)
      File.join(Rails.application.config.sqlino[:projects_dir], id)
    end
  end
end
