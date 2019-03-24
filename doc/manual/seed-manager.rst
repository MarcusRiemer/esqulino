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

Seed class takes two params ``seed_id`` which is mandatory a param must be passed as argument and ``dependencis`` is optional param only passed as argument if the Seed Model has dependencies.

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
      })
    end

Seed are stored in a yaml file with a prefix of ``seed_id`` in corresponding directory

all the dependencies will be stored in its own ``SEED_DIRECTORY`` and it will create a dependency manifest `seed_id-deps.yaml`` in the parent directory
which contains a set of three idential value, ``seed_path``, ``seed_id`` and ``seed_name``. seed name is the seed model name.

Images and sqlite databases are stored in respective ``SEED_DIRECTORY`` with the corresponding seed_id


Call to store a seed
~~~~~~~~~~~~~~~~~~~~

After seed class is defined according the above configuration and naming comvention (encouraged to follow), one can start stoing the data.
e.g: ``Seed::ProjectSeed.new(Project.first/Project.first.id).start_store`` 

Seed class can handle both Object or Object id

Seed class has designed to handle one id at a time, For a bulk storage or to store all data, the example call will look like:
``Project.all {|p| Seed::ProjectSeed.new(p.id).start_store}``

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

::

    def store(processed)
      if processed.include? [seed_directory, seed.id, self.class]
      else
        store_seed
        processed << [seed_directory, seed.id, self.class]
        store_dependencies(processed)
      end
      File.open(project_dependent_file(processed.first[0], processed.first[1]), "w") do |file|
        YAML::dump(processed, file)
      end
      store_image
    end

Method itself describes the steps ``processed.first`` contains the parent class information

If the Seed does not have any dependencies, no problem as the default value of the ``dependencies`` is an empty array.

Load procedure
--------------

Load procedure of the seed also declared in ``Seed::Base`` class

It follows very simple pattern. It takes ``seed_load_id`` aka ``seed_id`` if seed_id is not a object itself.

defined as:

::

    def load_seed_id
      return seed_id unless seed_id.is_a?(seed_name)
    end

As described in the Store Procedure, Seed class is configured with ``SEED_DIRECTORY`` and ``SEED_IDENTIFIER``.

So When we start loading a particular seed we already know the seed directory

Upsert seed data
~~~~~~~~~~~~~~~~

Upsert is meant to Insert or Update. As seed data is stored in a yaml file, we create a seed instance by loading the yaml file.

::

    def seed_instance
      YAML.load_file(seed_file_path)
    end

Now upserting data from seed file path

::

    def upsert_seed_data
      raise RuntimeError.new "Mismatched types, instance: #{seed_instance.class.name}, instance_type: #{seed_name.name}" if seed_instance.class != seed_name
      puts " Upserting data for #{seed_name}"
      db_instance = seed_name.find_or_initialize_by(id: load_seed_id)
      db_instance.assign_attributes(seed_instance.attributes)
      db_instance.save! if db_instance.changed?
      db_instance
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

To load a particular seed, the example call would look like:

``Seed::ProjectSeed.new(seed_id).start_load``

``start_load`` is defined as follows

::

    def start_load
      upsert_seed_data
      dep = File.join seed_directory, "#{load_seed_id}-deps.yaml"
      load_dependencies if File.exist? dep
    end

It calls dependencies if only deps file are present in the seed directory
