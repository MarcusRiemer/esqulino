============
Seed Manager
============

This part of the documentation is aimed to describe the store and load procedure of the seeds. It also describes the design part of it and how is it implemeted.
Seed Manager can be extendted easily for a new model with felxible extention tecnique.


Store Procedure
---------------

Store procedure is a Service provided by the application which is used to call to store data for a particular Model (e,g. Project, Grammar..) with all the dependencies.
It follows a simple pattern which evolves from ``Seed::Base``.
``Seed::Base`` is the parent class where all the necessary methods are declared.

Naming Convention and necessary configuration
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Seed Service follows a naming convention for the sake of the design which is part of Seed Module.
``<model_name>_seed.rb``  E,g. Seed class ``project_seed.rb``, ``project_uses_block_language_seed.rb``

Seed class takes three params ``seed_id`` which is mandatory a param must be passed as argument and ``dependencis`` is optional param only passed as argument if the Seed Model has dependencies and ``defer_referential_checks`` has default valu ``false`` unless any seed class privides other values based on the seed model's foreign_key_constraints.

``seed_id`` could be ``uid`` of the Model or Model object.

The instance varible ``seed_id`` is the id of the Model that will be stored or processed.

* other configuration parameters
    * ``SEED_IDENTIFIER = Project`` is the name of the model
    * ``SEED_DIRECTORY = "projects"`` is the seed directory to store the seed
* optional dependencies

::

    def initialize(seed_id)
      super(seed_id, dependencies = {
        ProjectUsesBlockLanguageSeed => "project_uses_block_languages",
        CodeResourceSeed => "code_resources",
        ProjectSourceSeed => "project_sources",
        ProjectDatabaseSeed => "project_databases",
        ProjectDatabaseSeed => "default_database",
      }, defer_referential_checks = true)
    end

Seed are stored in a yaml file with a prefix of ``seed_id`` in corresponding directory

all the dependencies will be stored in its own ``SEED_DIRECTORY`` and it will create a dependency manifest `seed_id-deps.yaml` in the parent directory
which contains a set of three idential value, ``seed_path``, ``seed_id`` and ``seed_name``. seed name is the seed model name.

Images and sqlite databases are stored in respective ``SEED_DIRECTORY`` with the corresponding seed_id


Call to store a seed
~~~~~~~~~~~~~~~~~~~~

After seed class is defined according the above configuration and naming comvention (encouraged to follow), one can start stoing the data.
e.g: ``Seed::ProjectSeed.new(Project.first/Project.first.id).start_store`` 

Seed class can handle both Object or Object id

`start_store` calls ``store`` method which takes a Set object as argument. Which has been used for storing dependencies.

::
 
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

``seed`` is the Model object we are storing either provided as constructor arguments or it calls a ``find`` on Model if provided seed_id is a id.

``dependencies`` hash contains ``{key => value}`` where key is dependent seed and value is the model attribute to call the on the parent model to get all relative records.

if the return data is not an array incase it has only one record its need to be serialized. And then each record has passed to store with corresponding seed model.

``processed`` is a set param with three values as the ``store`` method is designed to break the circular dependencies

``after_store_seed`` hook is called after ``store_seed`` to enable seed classed to override this method if something like image or database needs to be stored after seed is stored.

::

    def store(processed)
      if processed.include? [seed_directory, seed.id, self.class]
      else
        store_seed
        after_store_seed
        processed << [seed_directory, seed.id, self.class]
        store_dependencies(processed)
      end
      if dependencies.present?
        File.open(project_dependent_file(processed.first[0], processed.first[1]), "w") do |file|
          YAML::dump(processed, file)
        end
      end
    end

Method itself describes the steps ``processed.first`` contains the parent class information

If the Seed does not have any dependencies, no problem as the default value of the ``dependencies`` is an empty array.

Store all seed of a seed class
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
To store all data, the example call will look like:

``Seed::ProjectSeed.store_all`` or ``Seed::GrammarSeed.store_all``

Its a class method which calls ``store_all`` method on Seed class, defined as:

::

    def self.store_all
      self::SEED_IDENTIFIER.all.each { |s| new(s.id).start_store }
    end


Load procedure
--------------

Load procedure of the seed also declared in ``Seed::Base`` class

It follows very simple pattern. It takes ``seed_load_id`` aka ``seed_id`` if seed_id is not a object itself.

and retuns files base name if any yaml file is provided to load

defined as:

::

    def load_seed_id
      return File.basename(seed_id, ".*") if File.extname(seed_id.to_s).present? && File.extname(seed_id.to_s) == ".yaml"
      return seed_id unless seed_id.is_a?(seed_name)
    end


``load_id`` is generated based on the type of ``load_seed_id``, but always retruns an ``id`` regardelss of load_seed_id type

::

    def load_id
      if load_seed_id
        if string_is_uuid? load_seed_id.to_s
          load_seed_id.to_s
        else
          find_load_seed_id(load_seed_id.to_s)
        end
      end
    end


As described in the Store Procedure, Seed class is configured with ``SEED_DIRECTORY`` and ``SEED_IDENTIFIER``.

So When we start loading a particular seed we already know the seed directory

Upsert seed data
~~~~~~~~~~~~~~~~

Upsert is meant to Insert or Update. As seed data is stored in a yaml file, we create a seed instance by loading the yaml file.

::

    def seed_instance
      raise "Could not find project with slug or ID \"#{load_id}\"" unless File.exist? seed_file_path
      YAML.load_file(seed_file_path)
    end

Now upserting data from seed file path and after upserting it calls ``after_load_seed`` to load seed specific data

::

    def upsert_seed_data
      raise RuntimeError.new "Mismatched types, instance: #{seed_instance.class.name}, instance_type: #{seed_name.name}" if seed_instance.class != seed_name
      Rails.logger.info " Upserting data for #{seed_name}"
      db_instance = seed_name.find_or_initialize_by(id: load_seed_id)
      db_instance.assign_attributes(seed_instance.attributes)
      db_instance.save! if db_instance.changed?
      db_instance

      Rails.logger.info "Done with #{seed_name}"
      after_load_seed
    end

``seed_name`` is the defined  ``SEED_IDENTIFIER`` in the seed class

Code explains the steps of of intializng attributes for the model

It also handles dependencies by reading the the dependency manifest writtend during store procedure.

::

    def load_dependencies
      deps = File.join seed_directory, "#{load_seed_id}-deps.yaml"
      deps = YAML.load_file(deps)
      deps.each do |_, seed_id, seed|
        seed.new(seed_id).upsert_seed_data
      end
    end

Loads the ``...-deps.yaml`` file and takes each set data, where we need to take care of only last params one is seed_id and anoher is seed class.

Then it follwos the usual way to call ``upsert_seed_data`` method on seed instance.

Based on ``defer_referential_checks`` value it calls `` ActiveRecord::Base.connection.disable_referential_integrity`` which takes the transaction block to enable deffered constraints.

Otherwise just runs the upsert and other methods. As a final step it moves the data from intermediate tmp storage to origianl storage defined in Project seed

To load a particular seed, the example call would look like:

``Seed::ProjectSeed.new(seed_id).start_load``

``start_load`` is defined as follows

::

    def start_load
      run_within_correct_transaction do
        upsert_seed_data
        dep = File.join seed_directory, "#{load_id}-deps.yaml"
        load_dependencies if File.exist? dep
      end

      if @defer_referential_checks
        db_instance = seed_name.find_or_initialize_by(id: load_id)
        db_instance.touch
        db_instance.save!
      end
      move_data_from_tmp_to_data_directory
    end

It calls dependencies if only deps file are present in the seed directory

Load all seed data of a seed class
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

It's also a class method which calls ``load_all`` on seed class to be loaded, examle call will look like:

``Seed::ProjectSeed.load_all`` or ``Seed::GrammarSeed.load_all`` and defined as:

::

    def self.load_all
      Dir.glob(File.join load_directory, "*.yaml").each do |f|
        next if f =~ /deps/
        new(File.basename(f)).start_load
      end
    end

Which excludes dependecy files because deps are extendted name of the the processed ``seed_id`` which is constructed based on availabilty of dependencies and ``load_dependencies`` method takes care of those files.
