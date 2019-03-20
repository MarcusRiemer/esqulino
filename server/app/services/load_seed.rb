class LoadSeed
  require_dependency "block_language" # Rails won't autoload this class properly
  require_dependency "code_resource" # Rails won't autoload this class properly
  require_dependency "grammar" # Rails won't autoload this class properly
  require_dependency "project" # Rails won't autoload this class properly
  require_dependency "project_database" # Rails won't autoload this class properly
  require_dependency "project_source" # Rails won't autoload this class properly
  require_dependency "project_uses_block_language" # Rails won't autoload this class properly
  require_dependency "block_language_generator" # Rails won't autoload this class properly

  BASE_SEED_DIRECTORY = Rails.configuration.sqlino["seed"]["data_dir"]

  attr_reader :seed_id

  def initialize(seed_id)
    @seed_id = seed_id
  end

  def seed_file
    root = File.join BASE_SEED_DIRECTORY, seed_root
    File.join root, "#{seed_id}.yaml"
  end

  def find_seed_project_files(seed_root, seed_id)
    project_file = File.join seed_root, "#{seed_id}.yaml"
    YAML.load_file(project_file)
  end

  def seed_directory(seed_root:)
    File.join BASE_SEED_DIRECTORY, seed_root
  end

  def available_seed_files_for_project
    Dir.glob(File.join(seed_project_dir, "*.yaml"))
  end

  def load_project
    deps = File.join seed_directory(seed_root: "projects"), "#{seed_id}-deps.yaml"
    dependencies = YAML.load_file(deps)
    dependencies.each do |path, seed|
      upsert_seed_data(find_seed_project_files(path, seed))
    end
  end

  def upsert_seed_data(seed)
    puts " Upserting data for #{seed.class}"
    db_instance = seed.class.find_or_initialize_by(id: seed.id)
    db_instance.assign_attributes(seed.attributes)
    db_instance.save! if db_instance.changed?
    db_instance
  end
end
