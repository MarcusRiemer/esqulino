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
      @seed_data ||= seed_id.is_a?(seed_name) ? seed_id : find_seed(seed_id)
    end

    def find_seed(slug_or_id)
      seed_data = seed_name.where(id: slug_or_id).or(seed_name.where(slug: slug_or_id))
      raise ActiveRecord::RecordNotFound, "#{seed_name} not found" if seed_data.nil?
      seed_data
    end

    def seed_directory
      File.join BASE_SEED_DIRECTORY, self.class::SEED_DIRECTORY
    end

    def seed_specific_directory
      File.join seed_directory, seed.id
    end

    def seed_file_path
      File.join seed_directory, "#{seed.id}.yaml"
    end

    def project_dependent_file(directory, deps_id)
      File.join directory, "#{deps_id}-deps.yaml"
    end

    def start_store
      store(Set.new)
    end

    def store(processed)
      if processed.include? [seed_directory, seed_id.id]
      else
        store_seed
        processed << [seed_directory, seed_id.id]
        store_dependencies(processed)
      end
      File.open(project_dependent_file(processed.first[0], processed.first[1]), "w") do |file|
        YAML::dump(processed, file)
      end
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

    # projects/a123.yml db record
    # projects/a123-deps.yml dependent seeds [(source, b456), (db, 7891)]
    # projects/a123
    # projects/a123/images.json

  end
end
