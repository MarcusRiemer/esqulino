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
  PROJECT_SEED_ROOT = "projects"
  GRAMMAR_SEED_ROOT = "grammars"
  BLOCK_LANGUAGE_GENERATOR_SEED_ROOT = "block_language_generators"
  BLOCK_LANGUAGE_SEED_ROOT = "block_languages"

  attr_reader :seed_id

  def initialize(seed_id)
    @seed_id = seed_id
  end

  def find_seed_file(seed_root:, seed_id:)
    db_instance = File.join seed_directory(seed_root), "#{seed_id}.yaml"
    YAML.load_file(db_instance)
  end

  def find_seed_project_files(seed_root, seed_id)
    project_file = File.join seed_root, "#{seed_id}.yaml"
    YAML.load_file(project_file)
  end

  def seed_directory(seed_root)
    File.join BASE_SEED_DIRECTORY, seed_root
  end

  # loads the dependecy menifest first which is a set of dependent file path and seed_id
  # including project and then upserts the data accordingly
  def load_project
    deps = File.join seed_directory(PROJECT_SEED_ROOT), "#{seed_id}-deps.yaml"
    dependencies = YAML.load_file(deps)
    dependencies.each do |path, seed|
      upsert_seed_data(find_seed_project_files(path, seed))
    end
  end

  def load_grammar
    seed_instance = find_seed_file(seed_root: GRAMMAR_SEED_ROOT, seed_id: seed_id)
    upsert_seed_data(seed_instance)
  end

  def load_block_language_generator
    seed_instance = find_seed_file(seed_root: BLOCK_LANGUAGE_GENERATOR_SEED_ROOT, seed_id: seed_id)
    upsert_seed_data(seed_instance)
  end

  def load_block_language
    seed_instance = find_seed_file(seed_root: BLOCK_LANGUAGE_SEED_ROOT, seed_id: seed_id)
    upsert_seed_data(seed_instance)
  end

  protected

  def upsert_seed_data(seed)
    puts " Upserting data for #{seed.class}"
    db_instance = seed.class.find_or_initialize_by(id: seed.id)
    db_instance.assign_attributes(seed.attributes)
    db_instance.save! if db_instance.changed?
    db_instance
  end
end
