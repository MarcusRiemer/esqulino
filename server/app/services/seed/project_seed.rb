module Seed
  class ProjectSeed < Base
    attr_reader :project, :project_directory

    DEPENDENCIES = {
      "project_uses_block_languages" => "used_block_languages",
      "code_resources" => "code_resources",
      "project_sources" => "sources",
      "project_databases" => "databases"
    }
  
    def initialize(project_id)
      @project = project_id
      @project_directory = File.join BASE_SEED_DIRECTORY, "projects"
    end

    def project_id
      project.is_a?(Project) ? project : Project.with_exclusive.where(id: project).or(Project.with_exclusive.where(slug: project)).first
    end

    # Stores a specific project with all of its dependencies
    def store_project
      # Storing the actual project itself
      puts "Storing project #{project.readable_identification} ..."
      store_project_seed
      
      # Now stores dependencies
      DEPENDENCIES.each do |key, value|
        puts "Storing #{key}"
        project.send(key).each do |seed|
          store_project_dependencies(seed, value)
        end
      end

      # Storing images
      if File.directory? project.images_directory_path then
        puts "  Storing images"
        FileUtils.copy_entry(project.images_directory_path, seed_project_images_directory)
      end
    end

    protected

    def store_project_seed
      FileUtils.mkdir_p seed_projects_directory
      File.open(seed_projects_file, 'w') do |file|
        YAML::dump(project, file)
      end
    end

    def store_project_dependencies(seed, seed_path)
      FileUtils.mkdir_p dependent_data_directory(seed_path)
      File.open(dependent_seed_file(seed_path, seed), 'w') do |file|
        YAML::dump(seed, file)
      end
    end

    def dependent_data_directory(seed_path)
      File.join seed_projects_directory, seed_path
    end

    def seed_projects_directory
      File.join project_directory, project.id
    end

    def seed_projects_file
      File.join seed_projects_directory, "project.yaml"
    end

    def dependent_seed_file(seed_path, dependent_seed)
      File.join dependent_data_directory(seed_path), "#{dependent_seed.id}.yaml"
    end

    def seed_project_images_directory
      File.join seed_projects_directory, "images"
    end
  end
end