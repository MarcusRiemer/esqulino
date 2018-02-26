require_dependency 'error'

require_dependency 'project_database' # Rails won't autoload this class properly
require_dependency 'project_source' # Rails won't autoload this class properly
require_dependency 'project_uses_block_language' # Rails won't autoload this class properly

# @return True if the given string is a valid UUID
def string_is_uuid?(str)
  not /[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89aAbB][a-f0-9]{3}-[a-f0-9]{12}/.match(str).nil?
end

# This project on a whole will have some fairly sophisticated default datasets that
# need to be updated possibly even more frequently than the actual code. The end-goal
# of this class is to provide a solution to keep the "stock" projects of BlattWerkzeug
# up to date as easily as possible without any interference in the user data. Any admin
# should be sure that updating the "stock" data of BlattWerkzeug will never, ever damage
# the projects of the users ad.
#
# But the way to achieve that vision is not so straight forward:
#
# * The fact that  some data is stored "outside" of the normal database (images, SQLite
#   databases) does not make the import/export process more pleasant. So a simple "just
#   do a SQL-dump and be happy"-approach is not something we use. So we need a custom
#   storage format that can hold more then a simple SQL-blob.
#
# * What makes things worse is that we have some quite sophisticated dependencies
#   between models. Using UUIDs as primary keys eliminates a lot of problems (as long as
#   they don't collide ... Heaven help us if they do ...) because we can assume that
#   every new ID we bring in with the "stock" data is probably unique.
#
# Data migrations as a whole seem to be a very application specific topic, at least I
# could not find a suitable general-purpose library for our specific use-case. So we do
# what every programmer loves: We bring out our own solution ...
#
# This class holds together the whole serialization and deserialization process.
# We basically piggy-back the `to_yaml`-representation of ActiveModel to have a
# robust (but very verbose) on-disk representation of our models.
class SeedManager
  # The general directory to save and load the data from
  def seed_data_dir
    Rails.configuration.sqlino["seed"]["data_dir"]
  end

  # The specific directory for a certain project
  #
  # @param project_id [UUID] The id for this exact project
  def seed_general_projects_dir
    File.join seed_data_dir, "projects"
  end

  # The specific directory for a certain project
  #
  # @param project_id [UUID] The id for this exact project
  def seed_projects_dir(project_id)
    File.join seed_general_projects_dir, project_id
  end

  # The specific directory for a certain project
  #
  # @param project_id [UUID] The id for this exact project
  def seed_projects_file(project_id)
    File.join seed_projects_dir(project_id), "project.yaml"
  end

  # The specific directory for a certain project
  #
  # @param project_id [UUID] The id for this exact project
  def seed_project_images_dir(project_id)
    File.join seed_projects_dir(project_id), "images"
  end

  # The specific directory for code resources of a certain project
  #
  # @param project_id [UUID] The id of the parent project
  # @param code_resource_id [UUID] The id of the code resource
  def seed_project_code_resources_dir(project_id)
    File.join seed_projects_dir(project_id), "code_resources"
  end

  # The specific directory for code resources of a certain project
  #
  # @param project_id [UUID] The id of the parent project
  # @param code_resource_id [UUID] The id of the code resource
  def seed_project_code_resources_file(project_id, code_resource_id)
    File.join seed_project_code_resources_dir(project_id), "#{code_resource_id}.yaml"
  end

  # The specific directory for given sources of a certain project
  #
  # @param project_id [UUID] The id of the parent project
  def seed_project_sources_dir(project_id)
    File.join seed_projects_dir(project_id), "sources"
  end

  # The specific file for a code resource of a certain project
  #
  # @param project_id [UUID] The id of the parent project
  # @param project_source_id [UUID] The id of the source
  def seed_project_sources_file(project_id, project_source_id)
    File.join seed_project_sources_dir(project_id), "#{project_source_id}.yaml"
  end

  # The specific directory for referenced block languages of a certain project
  #
  # @param project_id [UUID] The id of the parent project
  def seed_project_used_block_languages_dir(project_id)
    File.join seed_projects_dir(project_id), "used_block_languages"
  end

  # The specific file for a used block language of a certain project
  #
  # @param project_id [UUID] The id of the parent project
  # @param project_source_id [UUID] The id of the block language
  def seed_project_used_block_languages_file(project_id, block_language_id)
    File.join seed_project_used_block_languages_dir(project_id), "#{block_language_id}.yaml"
  end

  # The general directory for block languages
  #
  # @param project_id [UUID] The id of the parent project
  def seed_project_databases_dir(project_id)
    File.join seed_projects_dir(project_id), "databases"
  end

  # The general directory for block languages
  #
  # @param project_id [UUID] The id of the parent project
  def seed_project_databases_file(project_id, database_id)
    File.join seed_project_databases_dir(project_id), "#{database_id}.yaml"
  end

  # The general directory for block languages
  def seed_block_languages_dir
    File.join seed_data_dir, "block_languages"
  end

  # Path to a specific block language
  def seed_block_languages_file(block_language_id)
    File.join seed_block_languages_dir, "#{block_language_id}.yaml"
  end

  # Writes all projects to their seed representation
  def store_all_projects
    Project.with_exclusive.all.each { |p| store_project(p) }
  end

  # Loads all projects that are available as seeds
  def load_all_projects
    available_seed_project_files.each { |b| load_project(b) }
  end

  # Loads a specific block language
  #
  # @param path_slug_or_id [string]
  #   The path, slug or the ID of the project to load.
  def load_project(path_slug_or_id)
    begin
      # Construct the "new" instance
      seed_instance = find_seed_project_file(path_slug_or_id)

      # Breaking circular dependencies (Part 1)
      # The following referenced resources do not exist while creation is in progress:
      # * default_database_id
      default_database_id = seed_instance.default_database_id
      seed_instance.default_database_id = nil

      # Moving the old data folder out of the way, it will be restored if
      # anything goes wrong
      project_folder_path = seed_instance.data_directory_path
      project_folder_backup_path = project_folder_path + '_bak'

      # Is there an actual older folder?
      if File.directory? project_folder_path then
        # Yes, back it up
        FileUtils.mv project_folder_path, project_folder_backup_path
      else
        # No, so there is no need to backup anything
        project_folder_backup_path = nil # No need for backup
      end

      # Actually kick off project "creation"
      p = seed_instance(seed_instance, Project, 0);

      # Restore the used block languages ...
      available_seed_project_used_block_languages_files(p.id).each do |b|
        seed_instance(YAML.load_file(b), ProjectUsesBlockLanguage, 1)
      end

      # ... and code resources ...
      available_seed_project_code_resource_files(p.id).each do |c|
        seed_instance(YAML.load_file(c), CodeResource, 1)
      end

      # ... and sources ...
      available_seed_project_source_files(p.id).each do |s|
        seed_instance(YAML.load_file(s), ProjectSource, 1)
      end

      # ... and databases ...
      available_seed_project_used_database_files(p.id).each do |db_yaml|
        db = seed_instance(YAML.load_file(db_yaml), ProjectDatabase, 1)

        # Ensure there is a target folder
        database_target_folder = File.join(p.data_directory_path, "databases")
        FileUtils.mkdir_p database_target_folder

        # Copy over the actual data, it MUST reside alongside the YAML
        # file and may only have a differing extension
        sqlite_filename = Pathname(db_yaml).sub_ext('.sqlite')

        FileUtils.cp sqlite_filename, database_target_folder
      end

      # ... and images.
      if File.directory? seed_project_images_dir(p.id)
        puts "  COPY   Images"
        FileUtils.mkdir_p p.images_directory_path
        FileUtils.copy_entry seed_project_images_dir(p.id), p.images_directory_path
      end

      # Breaking circular dependencies (Part 2)
      p.default_database_id = default_database_id
      p.save!

      # Because everything went fine: No need for a backup
      FileUtils.rm_rf project_folder_backup_path unless project_folder_backup_path.nil?
    rescue EsqulinoError => e
      if not project_folder_backup_path.nil? then
        # Delete the (possibly) partial data folder
        FileUtils.rm_rf project_folder_path
        # And move the original data back
        FileUtils.mv project_folder_backup_path, project_folder_path
      end

      raise
    end
  end

  # Stores a specific project with all of its dependencies
  #
  # @param project_slug_or_id [Project|string]
  #   Given projects will be used directly, strings will be matched against
  #   IDs or slugs of the existing projects.
  def store_project(project_slug_or_id)
    p = if project_slug_or_id.is_a? Project then
          project_slug_or_id
        else
          # Finding the correct project
          slug_or_id = project_slug_or_id
          Project.with_exclusive.where(id: slug_or_id).or(Project.with_exclusive.where(slug: slug_or_id)).first
        end

    # Storing the actual project itself
    puts "Storing project #{p.readable_identification} ..."
    FileUtils.mkdir_p seed_projects_dir(p.id)
    File.open(seed_projects_file(p.id), 'w') do |file|
      YAML::dump(p, file)
    end

    # Storing referenced block languages
    p.project_uses_block_languages.each do |u|
      FileUtils.mkdir_p seed_project_used_block_languages_dir(p.id)
      puts "  Storing referenced block language #{u.block_language.readable_identification}"
      File.open(seed_project_used_block_languages_file(p.id, u.id), 'w') do |file|
        YAML::dump(u, file)
      end
    end

    # Storing associated code resources
    p.code_resources.each do |c|
      FileUtils.mkdir_p seed_project_code_resources_dir(p.id)
      puts "  Storing code resource #{c.readable_identification}"
      File.open(seed_project_code_resources_file(p.id, c.id), 'w') do |file|
        YAML::dump(c, file)
      end
    end

    # Storing associated sources
    p.project_sources.each do |s|
      FileUtils.mkdir_p seed_project_sources_dir(p.id)
      puts "  Storing project source #{s.readable_identification}"
      File.open(seed_project_sources_file(p.id, s.id), 'w') do |file|
        YAML::dump(s, file)
      end
    end

    # Storing associated databases
    p.project_databases.each do |db|
      FileUtils.mkdir_p seed_project_databases_dir(p.id)
      puts "  Storing project database #{db.readable_identification}"
      File.open(seed_project_databases_file(p.id, db.id), 'w') do |file|
        YAML::dump(db, file)
      end

      puts "  Copying data of project database #{db.readable_identification}"
      FileUtils.cp(db.sqlite_file_path, seed_project_databases_dir(p.id))
    end

    # Storing images
    if File.directory? p.images_directory_path then
      puts "  Storing images"
      FileUtils.copy_entry(p.images_directory_path, seed_project_images_dir(p.id))
    end
  end

  # Stores all block languages
  def store_all_block_languages
    BlockLanguage.all.each { |b| store_block_language b }
  end

  # Loads all block languages that are available as seeds
  def load_all_block_languages
    available_seed_block_language_files.each { |b| load_block_language(b) }
  end

  # Stores a specific block language
  #
  # @param slug_or_id [string] The slug or the ID of the project to store.
  def store_block_language(block_language_slug_or_id)
    b = if block_language_slug_or_id.is_a? BlockLanguage then
          block_language_slug_or_id
        else
          # Finding the correct project
          slug_or_id = block_language_slug_or_id
          BlockLanguage.where(id: slug_or_id).or(BlockLanguage.where(slug: slug_or_id)).first
        end

    puts "Storing block language #{b.readable_identification}"

    # Ensuring all directories are available
    FileUtils.mkdir_p seed_block_languages_dir

    # Storing the language
    File.open(seed_block_languages_file(b.id), 'w') do |file|
      YAML::dump(b, file)
    end
  end

  # Loads a specific block language
  #
  # @param path_slug_or_id [string]
  #   The path, slug or the ID of the block language to load.
  def load_block_language(path_slug_or_id)
    seed_instance(find_seed_block_language(path_slug_or_id), BlockLanguage, 0)
  end

  private

  # Takes the given instance that has been loaded from a YAML-file and
  # updates the connected database accordingly.
  #
  # @param instance The instance to persist, loaded from an ActiveRecord YAML file
  # @param instance_type
  #   This parameter must match `instance.class` and is a failsafe to ensure two things:
  #   1) The instance that has been loaded has the correct type
  #   2) The call-site triggers Rails auto loading as early as possible
  # @param depth Controls the indentation
  def seed_instance(instance, instance_type, depth)
    # Ensure we don't have any stupid errors because we try to trigger
    # Rails auto-loading mechanism early
    raise RuntimeError.new "Mismatched types, instance: #{instance.class.name}, instance_type: #{instance_type.name}" if instance.class != instance_type
    
    keyword = "ERROR" # Used to represent what we did with this instance: CREATE, UPDATE, SKIP
    
    # Grab a database-connected variant of that instance
    db_instance = instance.class.find_by(instance.key_search_attributes)
    if db_instance.nil? then
    # Nothing here, lets create it
      db_instance = instance_type.new(instance.attributes)
      keyword = "CREATE"
    else
      db_instance.assign_attributes(instance.attributes)
      keyword = db_instance.changed? ? "UPDATE" : "SKIP  "
    end

    puts "#{'  ' * depth}#{keyword} #{db_instance.class.name} #{db_instance.readable_identification}"

    # Possibly update it
    if keyword == "CREATE" || keyword == "UPDATE" then
      db_instance.save!
    end

    return db_instance
  end

  # Searches for a specific seeded project using either path, the ID or the slug
  #
  # TODO: This is structurally redundant, see #find_seed_block_language
  def find_seed_project_file(path_slug_or_id)
    # Does the file exist immediatly?
    if File.exists? path_slug_or_id then
      # Yes, we are done
      YAML.load_file path_slug_or_id
    # Is is it UUID?
    elsif string_is_uuid? path_slug_or_id then
      # Yes, we are done
      YAML.load_file seed_projects_file(path_slug_or_id)
    # Okay, no shortcuts available ... Lets iterate over all existing project seed files
    else
      available_seed_project_files.each do |f|
        p = YAML.load_file(f)
        return p if (p.slug == path_slug_or_id)
      end

      # This shouldn't happen too often ...
      raise "Could not find project with slug or ID \"#{path_slug_or_id}\""
    end
  end


  # Searches for a specific seeded block language using either path, the ID or the slug
  def find_seed_block_language(path_slug_or_id)
    # Does the file exist immediatly?
    if File.exists? path_slug_or_id then
      # Yes, we are done
      YAML.load_file(path_slug_or_id)
    # Is is it UUID?
    elsif string_is_uuid? path_slug_or_id then
      # Yes, we are done
      YAML.load_file(seed_block_languages_file(path_slug_or_id))
    # Okay, no shortcuts available ... Lets iterate over all existing block language seed files
    else
      available_seed_project_files.each do |f|
        b = YAML.load_file(f)
        return b if (b.slug == path_slug_or_id)
      end

      # This shouldn't happen too often ...
      raise "Could not find block language with slug or ID \"#{slug_or_id}\""
    end
  end

  # @return [Iterable] All files that are possibly a seed file for a block language
  def available_seed_block_language_files
    Dir.glob(File.join(seed_block_languages_dir, '*.yaml'))
  end

  # @return [Iterable] All files that are possibly a seed file for a project
  def available_seed_project_files
    Dir.glob(File.join(seed_general_projects_dir, '**/project.yaml'))
  end

  # @return [Iterable] All files that are possibly a seed file for a code resource of a project
  def available_seed_project_code_resource_files(project_id)
    Dir.glob(File.join(seed_project_code_resources_dir(project_id), '*.yaml'))
  end

  # @return [Iterable] All files that are possibly a seed file for a source of a project
  def available_seed_project_source_files(project_id)
    Dir.glob(File.join(seed_project_sources_dir(project_id), '*.yaml'))
  end

  # @return [Iterable] All files that are possibly a seed file for a referenced block language of a project
  def available_seed_project_used_block_languages_files(project_id)
    Dir.glob(File.join(seed_project_used_block_languages_dir(project_id), '*.yaml'))
  end

  # @return [Iterable] All sqlite-database-files that are part of the given project
  def available_seed_project_used_database_files(project_id)
    Dir.glob(File.join(seed_project_databases_dir(project_id), '*.yaml'))
  end

  # Singleton instance of the SeedManager
  def self.instance
    @@instance ||= SeedManager.new
  end
end
