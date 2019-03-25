module Seed
  class Base
    BASE_SEED_DIRECTORY = Rails.configuration.sqlino["seed"]["data_dir"]

    attr_reader :seed_id, :dependencies

    def seed_name
      self.class::SEED_IDENTIFIER
    end

    def initialize(seed_id, dependencies = [])
      @seed_id = seed_id
      @dependencies = dependencies
    end

    def seed
      return nil if File.extname(seed_id.to_s).present?
      @seed_data ||= seed_id.is_a?(seed_name) ? seed_id : find_seed(seed_id)
    end

    def load_seed_id
      return File.basename(seed_id, ".*") if File.extname(seed_id.to_s).present? && File.extname(seed_id.to_s) == ".yaml"
      return seed_id unless seed_id.is_a?(seed_name)
      nil
    end

    def find_seed(slug_or_id)
      seed_data = seed_name.where(id: slug_or_id).or(seed_name.where(slug: slug_or_id))
      raise ActiveRecord::RecordNotFound, "#{seed_name} not found" if seed_data.nil?
      seed_data.first
    end

    def seed_directory
      File.join BASE_SEED_DIRECTORY, self.class::SEED_DIRECTORY
    end

    def seed_specific_directory
      File.join seed_directory, load_seed_id || seed.id
    end

    def store_image; end

    def seed_file_path
      File.join seed_directory, "#{load_seed_id || seed.id}.yaml"
    end

    def project_dependent_file(directory, deps_id)
      File.join directory, "#{deps_id}-deps.yaml"
    end

    def start_store
      store(Set.new)
    end

    def store(processed)
      if processed.include? [seed_directory, seed.id, self.class]
      else
        store_seed
        processed << [seed_directory, seed.id, self.class]
        store_dependencies(processed)
      end
      if dependencies.present?
        File.open(project_dependent_file(processed.first[0], processed.first[1]), "w") do |file|
          YAML::dump(processed, file)
        end
      end
      store_image
    end

    def store_dependencies(processed)
      dependencies.each do |dependent_seed_name, seed_model_attribute|
        data = seed.send(seed_model_attribute)
        to_serialize = (data || [])
        if not to_serialize.respond_to?(:each)
          to_serialize = [to_serialize]
        end
        to_serialize.each do |dep_seed|
          dependent_seed_name.new(dep_seed)
            .store(processed)
        end
      end
    end

    def store_seed
      FileUtils.mkdir_p seed_directory
      File.open(seed_file_path, "w") do |file|
        YAML::dump(seed, file)
      end
    end

    def start_load
      upsert_seed_data
      dep = File.join seed_directory, "#{load_seed_id}-deps.yaml"
      load_dependencies if File.exist? dep
    end

    def seed_instance
      YAML.load_file(seed_file_path)
    end

    def upsert_seed_data
      raise RuntimeError.new "Mismatched types, instance: #{seed_instance.class.name}, instance_type: #{seed_name.name}" if seed_instance.class != seed_name
      puts " Upserting data for #{seed_name}"
      db_instance = seed_name.find_or_initialize_by(id: load_seed_id)
      db_instance.assign_attributes(seed_instance.attributes)
      db_instance.save! if db_instance.changed?
      db_instance
      puts "Done with #{seed_name}"
    end

    def load_dependencies
      deps = File.join seed_directory, "#{load_seed_id}-deps.yaml"
      deps = YAML.load_file(deps)
      deps.each do |_, seed_id, seed|
        seed.new(seed_id).upsert_seed_data
      end
    end

    # has to be class method to load files started outside of instance scope or from global scope
    def self.load_all
      Dir.glob(File.join load_directory, "*.yaml").each do |f|
        next if f =~ /deps/
        new(File.basename(f)).start_load
      end
    end

    def self.load_directory
      File.join BASE_SEED_DIRECTORY, self::SEED_DIRECTORY
    end

    # class method to call on seed instance on identifier
    def self.store_all
      self::SEED_IDENTIFIER.all.each { |s| new(s.id).start_store }
    end
  end
end
