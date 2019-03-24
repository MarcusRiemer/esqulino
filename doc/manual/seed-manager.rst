============
Seed Manager
============

This part of the documentation is aimed to describe the store and load procedure of the seeds. It also describes the design part of it and how is it implemeted.
Seed Manager can be extendted easily for a new model with felxible extention tecnique.

Store Procedure
---------------

Store procedure is a Service provided by the application which is used to call to store data for a particular Model (e,g. Project, Grammar..) with all the dependencies.
It follows a simple pattern which evolves from ``Seed::Base`` class. ``Seed::Base`` is the parent where all the necessary methods are declared.

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
    .. code-block:: ruby
      def initialize(seed_id)
        super(seed_id, dependencies = {
          ProjectUsesBlockLanguageSeed => "project_uses_block_languages",
          CodeResourceSeed => "code_resources",
          ProjectSourceSeed => "project_sources",
          ProjectDatabaseSeed => "project_databases",
          ProjectDatabaseSeed => "default_database",
        })
      end

all the dependencies will be stored in its own ``SEED_DIRECTORY`` and it will create a dependency manifest `seed_id-deps.yaml`` in the parent directory
which contains a set of three idential value, ``seed_path``, ``seed_id`` and ``seed_name``. seed name is the seed model name.

Images and sqlite databases are stored in respective ``SEED_DIRECTORY`` with the corresponding seed_id

Call to store a seed
~~~~~~~~~~~~~~~~~~~~

After seed class is defined according the above configuration and naming comvention (encouraged to follow), one can start stoing the data.
e.g: ``Seed::ProjectSeed.new(Project.first/Project.first.id).start_store`` Seed class can handle both Object or Object id

Seed class has designed to handle one id at a time, For a bulk storage or to store all data, the example call will look like:
``Project.all {|p| Seed::ProjectSeed.new(p.id).start_store}``
