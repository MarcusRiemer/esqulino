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

    # Storing images

  end
end
