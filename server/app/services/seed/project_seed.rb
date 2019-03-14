module Seed
  class ProjectSeed < Base
    SEED_IDENTIFIER = Project
    SEED_DIRECTORY = "projects"

    def initialize(seed_id)
      super(seed_id, dependencies = {
        ProjectUsesBlockLanguageSeed => "project_uses_block_languages",
        CodeResourceSeed => "code_resources",
        ProjectSourceSeed => "project_sources",
        ProjectDatabaseSeed => "project_databases",
        ProjectDatabaseSeed => "default_database",
      })
    end

    def store_image
      if File.directory? seed.images_directory_path
        puts "Storing images"
        FileUtils.copy_entry(seed.images_directory_path, seed_specific_directory)
      end
    end
  end
end
