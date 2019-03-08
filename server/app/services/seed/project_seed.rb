module Seed
  class ProjectSeed < Base
    SEED_IDENTIFIER = Project
    SEED_DIRECTORY = "projects"

    def initialize(seed_id)
      @dependencies = {
          ProjectUsesBlockLanguageSeed => "project_uses_block_languages",
          CodeResourceSeed => "code_resources",
          ProjectSourceSeed => "project_sources",
          ProjectDatabaseSeed => "project_databases",
          ProjectDefaultDatabaseSeed => "default_database",
        }
      super(seed_id)
    end
  end
end