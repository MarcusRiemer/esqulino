module Seed
  class Base
    # base seed class as a parent class designed as a service to store and load seed classes with all the supported methods
    # BASE_SEED_DIRECTORY is a autoloaded pathe defined in sqlino.yaml in the config
    BASE_SEED_DIRECTORY = Rails.configuration.sqlino["seed"]["data_dir"]

    attr_reader :seed_id, :dependencies

    # look-up method for the model we want to process for seeding
    # SEED_IDENTIFIER defines the class of the Model, e.g  SEED_IDENTIFIER = Project
    def seed_name
      self.class::SEED_IDENTIFIER
    end

    # @param seed_id is either an id or an object and dependencies param with default value empty array
    # dependencies are passed if there is any
    def initialize(seed_id, dependencies = [])
      @seed_id = seed_id
      @dependencies = dependencies
    end

    # returns seed as Object of the model if one is not provided
    # returns nil if seed_id is not an object_id or object
    def seed
      return nil if File.extname(seed_id.to_s).present?
      @seed_data ||= seed_id.is_a?(seed_name) ? seed_id : find_seed(seed_id)
    end

    # When loading a seed, it's usualy the case that the provided seed_id is a yaml file
    # returns the seed_id as load_seed_id extracted form the yaml file
    # otherwise return nil
    def load_seed_id
      return File.basename(seed_id, ".*") if File.extname(seed_id.to_s).present? && File.extname(seed_id.to_s) == ".yaml"
      return seed_id unless seed_id.is_a?(seed_name)
      nil
    end

    # if seed_id is an id or slug of the object, return the object
    def find_seed(slug_or_id)
      seed_data = seed_name.where(id: slug_or_id).or(seed_name.where(slug: slug_or_id))
      raise ActiveRecord::RecordNotFound, "#{seed_name} not found" if seed_data.nil?
      seed_data.first
    end

    # seed_direcotry is defined in combination with
    # BASE_SEED_DIRECTORY and SEED_DIRECTORY configured in the seed specific files
    def seed_directory
      File.join BASE_SEED_DIRECTORY, self.class::SEED_DIRECTORY
    end

    # this directory is used to store particular seed model related seeds under the that seed_id,
    # such as store image for ProjectSeed
    def seed_specific_directory
      File.join seed_directory, load_seed_id || seed.id
    end

    # Abstract methods for seed specific cases
    def store_image; end
    def copy_database; end

    # Constructs a storing seed or loading seed file path
    def seed_file_path
      File.join seed_directory, "#{load_seed_id || seed.id}.yaml"
    end

    # if there is any depedency of a particular Seed model, it creates a manifest file
    # following a naming convention ....-deps.yaml which contains the dependent seeds info
    def project_dependent_file(directory, deps_id)
      File.join directory, "#{deps_id}-deps.yaml"
    end

    # class method to call on seed instance on identifier
    # takes all the records from the Model(identifier) and start storing
    def self.store_all
      self::SEED_IDENTIFIER.all.each { |s| new(s.id).start_store }
    end

    # calls the store method with an empty set which is populated with seed_directory, seed.id, self.class
    # during the storing process
    def start_store
      store(Set.new)
    end

    # store is responsible to store the seed
    # checks the if one has been already processed, usally when there is a dependecy,
    # it's required to break circular dependecy in the recursion process
    # calls store_seed and writes dependency mafifest(-deps.yaml) and all other things need to be stored
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
      copy_database
    end

    # calls the dependent model on parent using send and serialize it
    # recursively calls store method to handle all the dependencies
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

    # dump data into a yaml file in the seed direcotry
    def store_seed
      FileUtils.mkdir_p seed_directory
      File.open(seed_file_path, "w") do |file|
        YAML::dump(seed, file)
      end
    end

    # Loads the data from the yaml to database
    # load dependecies of a particular project if there is any
    def start_load
      upsert_seed_data
      dep = File.join seed_directory, "#{load_seed_id}-deps.yaml"
      load_dependencies if File.exist? dep
    end

    # load yaml dump as seed instaces ready to be loaded
    def seed_instance
      YAML.load_file(seed_file_path)
    end

    # raise if the seed_instance class does not match with the seed_name (model or Identifier) are not matched
    # instantiate a new record if there is none by the provided load_seed_id or find the the existing one
    # save the instance if theere is a change
    def upsert_seed_data
      raise RuntimeError.new "Mismatched types, instance: #{seed_instance.class.name}, instance_type: #{seed_name.name}" if seed_instance.class != seed_name
      puts " Upserting data for #{seed_name}"
      db_instance = seed_name.find_or_initialize_by(id: load_seed_id)
      db_instance.assign_attributes(seed_instance.attributes)
      db_instance.save! if db_instance.changed?
      db_instance
      puts "Done with #{seed_name}"
    end

    # reads the dependency file and takes the seed_id and seed class
    # call the seed class with upsert_seed_data method to load the dependent data tables
    def load_dependencies
      deps = File.join seed_directory, "#{load_seed_id}-deps.yaml"
      deps = YAML.load_file(deps)
      deps.each do |_, seed_id, seed|
        seed.new(seed_id).upsert_seed_data
      end
    end

    # class method to load files started outside of instance scope or from global scope
    # skips dependecy files(-deps.yaml) which is handled by load_dependencies
    # calls a new instance of the seed class with start_load for all the available loadable files
    def self.load_all
      Dir.glob(File.join load_directory, "*.yaml").each do |f|
        next if f =~ /deps/
        new(File.basename(f)).start_load
      end
    end

    # builds the load directroy used for loading all data under it outside the scope of class instance
    def self.load_directory
      File.join BASE_SEED_DIRECTORY, self::SEED_DIRECTORY
    end
  end
end
