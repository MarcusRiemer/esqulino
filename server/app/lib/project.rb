# coding: utf-8
require 'json'
require 'yaml'
require 'securerandom' # To generate UUIDs
require 'fileutils'    # To create directory trees
require 'scrypt'

require_dependency 'schema'
require_dependency 'schema_utils'
require_dependency 'page'
require_dependency 'error'
require_dependency 'query_simulate'
require_dependency 'version'

# Represents an esqulino project. Attributes of this
# class are loaded lazily on demand, so there is no harm
# in creating loads of instances.
class Project
  # @param project_folder [string] The projects root folder
  # @param write_access [Boolean] True, if this project should be openend in read-only mode
  def initialize(project_folder, write_access)
    @project_folder = project_folder
    @whole_description = nil
    @pages = nil
    @queries = nil
    @images = nil   # TODO: Load on demand
    @schema = { }
    @write_access = write_access
  end

  attr_accessor :write_access

  # The path to the folder this project is stored in
  def folder
    @project_folder
  end

  # The path to the folder this project stores its pages.
  def folder_pages
    File.join(@project_folder, "pages")
  end

  # The path to the folder this project stores its queries.
  def folder_queries
    File.join(@project_folder, "queries")
  end

  # The path to the folder where this project stores its databases
  def folder_databases
    File.join(@project_folder, "databases")
  end

  # Retrieves the id of the default database from the description
  def default_database_id
    whole_description.fetch('activeDatabase', 'default')
  end

  # The path to the currently active SQLite database
  #
  # @param database_id[string] The id of the database in question. If this is nil
  #                            the current default database will be used.
  def file_path_sqlite(database_id = nil)
    # Go with the default first, then check whether we
    # have something more specific
    database_id = default_database_id if database_id.nil?
    used_database = available_databases.fetch(database_id)

    File.join(self.folder_databases, used_database['path'])
  end

  # Maps the ID of a database to a physical path
  def file_path_sqlite_from_id(db_id)
    File.join(self.folder_databases, db_id + '.sqlite')
  end

  # @return The id of this project
  def id
    File.basename @project_folder
  end

  # @return True, if at least the project folder and a model file exist
  def exists?
    File.directory? @project_folder and File.exists? self.description_filename
  end

  # @return True, if this project is public
  def public?
    load_description! if @whole_description.nil?
    @whole_description['public']
  end

  # Throws if the project was openend without write_access
  def assert_write_access!
    raise AuthorizationError.new "Project opened without write access!" unless @write_access
  end

  # Loads all parts of the model that have not been loaded so far. This
  # does explicitly not reload parts that have been loaded already!
  def load!
    load_description! if @whole_description.nil?
    load_schema! if not @schema.key? self.default_database_id
    load_pages! if @pages.nil?
    load_queries! if @queries.nil?
  end

  # Removes this project and all its traces from disk
  def delete!
    assert_write_access!
    FileUtils.rm_rf @project_folder
  end

  # Turn a project into a JSON description
  def to_json(options)
    # The JSON representation is always meant to be complete
    load!

    # Enrich the description itself with the more complex attributes
    public_description.merge(
      {
        :schema => schema,
        :queries => @queries,
        :pages => @pages,
        :id => self.id,
        :availableDatabases => self.available_databases
      }
    ).to_json(options)
  end

  # @return The path to the file that stores the project model
  def description_filename
    File.join(@project_folder, "config.yaml")
  end

  # Loads the projects model from disk
  def load_description!
    #TODO swap the project description to DB with yaml
    # Ensure this is actually a loadable project
    raise UnknownProjectError.new(id) unless self.exists?
    @whole_description = YAML.load_file(description_filename);
  
    assert_resource_version(@id, "project", @whole_description['apiVersion'])
  end

  # @return Every information about the core project itself.
  def whole_description
    load_description! if @whole_description.nil?
    return (@whole_description)
  end

  # Merges the new model into the model of this project. Values of the
  # new model take precedence, values that are not mentioned in the
  # new model are left untouched.
  def update_description!(new_model)
    load_description! if @whole_description.nil?

    # Merge in everything that is new
    @whole_description.merge! new_model

    # And remove everything that is nil
    @whole_description.select! {|k,v| !v.nil?}

    # Possibly remove the index page (if it doesn't exist)
    check_index_page!
  end

  # Checks whether the current index page exists, deletes the
  # page-ID from the model if it doesn't exist
  def check_index_page!
    index_page_id = whole_description['indexPageId']
    if index_page_id then
      index_page = Page.new(self, index_page_id)
      if not index_page.exists? then
        # puts "Removing reference to index page"
        @whole_description.delete 'indexPageId'
        # puts @whole_description.to_s
      end
    end
  end

  # Saves the current model to disk. This requires the project to be currently
  # loaded. If it is not loaded an exception is thrown because
  #
  # a) Writing an unloaded project would destroy the previously stored description
  # b) Loading and immediatly saving is effectively a NOOP
  #
  # Or to put in other terms: Saving something that hasn't been loaded smells like
  # something that would never happen on purpose.
  def save_description
    assert_write_access!

    raise EsqulinoError, "Attempted to save unloaded project" if @whole_description.nil?

    File.open(description_filename, "w") do |f|
      # Save everything but the ID
      f.write(@whole_description.tap{|d| d.delete('id') }.to_yaml)
    end
  end

  # Strips information from a project description that is not meant to be
  # public. Technically this works by copying over a subset of properties
  # that are known, so unknown properties will *always* get stripped. Or
  # to put it in simpler terms: This approach uses a whitelist, you can't
  # add arbitrary fields to the projects description and hope that they
  # will be visible on the client without modifying this method.
  def public_description
    whole_info = whole_description
    to_return = {}

    to_return['name'] = whole_info['name']
    to_return['description'] = whole_info['description']
    to_return['id'] = self.id
    to_return['slug'] = whole_info['slug']
    to_return['preview'] = whole_info['preview']
    to_return['indexPageId'] = whole_info['indexPageId']
    to_return['apiVersion'] = whole_info['apiVersion']
    to_return['activeDatabase'] = whole_info['activeDatabase']
    to_return['sources'] = whole_info['sources']

    return to_return;
  end

  # @return True, if a preview image exists
  def preview_image_exists?
    path = self.preview_image_path
    not path.nil? and File.exists? path
  end

  # @return Path to the preview image, may be nil of no image is set
  def preview_image_path
    load_description! if @whole_description.nil?

    local_path = @whole_description['preview']
    if local_path then
      File.expand_path(local_path, @project_folder)
    else
      return nil
    end
  end

  # Queries the associated database for its schema
  #
  # @param database_id[string] The database to load, nil if the default database
  #                            should be used.
  def load_schema!(database_id = nil)
    database_id = default_database_id if database_id.nil?

    @schema[database_id] = database_describe_schema(self.file_path_sqlite database_id)
  end

  # Information about the structure of the database
  # @param database_id[string] The database to load, nil if the default database
  #                            should be used.
  def schema(database_id = nil)
    database_id = default_database_id if database_id.nil?

    load_schema! database_id if not @schema.key? self.default_database_id
    return @schema.fetch database_id
  end

  # @return A list of all databases that are available to this project
  def available_databases
    whole_description.fetch('databases')
  end

  # Loads all queries that are associated with this project
  def load_queries!
    # Glob all JSON files in the queries folder
    @queries = Dir.glob(File.join(folder_queries,"*.json")).map do |query_file|
      # Each filename contains an ID
      query_id = File.basename(query_file, ".json")
      Query.new(self, query_id, nil)
    end
  end

  # All queries that are associated with this project
  def queries
    load_queries! if @queries.nil?
    return (@queries)
  end

  # @param query_id The ID of the query
  def query_by_id(query_id)
    to_return = queries.find {|query| query.id == query_id}
    raise UnknownQueryError.new(self.id, query_id) if to_return.nil?

    return (to_return)
  end

  # Simulates the execution of a INSERT query in the context of this project.
  #
  # @param sql [string] The SQL query
  # @param params [Hash] Query parameters
  def simulate_insert_sql(sql, params, database_id = nil)
    execute_sql_raw(sql, params, database_id, true) do |db|
      SimulateSql.insert_sql(db, sql, params)
    end
  end

  # Simulates the execution of a DELETE query in the context of this project.
  #
  # @param sql [string] The SQL query
  # @param params [Hash] Query parameters
  def simulate_delete_sql(sql, params, database_id = nil)
    execute_sql_raw(sql, params, database_id, true) do |db|
      SimulateSql.delete_sql(db, sql, params)
    end
  end

  # Executes a query in the context of this project. This is of course
  # a major security concern and shouldn't be done lightly.
  #
  # @param sql [string] The SQL query
  # @param params [Hash] Query parameters
  #
  # @return [Hash] { columns :: List, rows :: List of List }
  def execute_sql(sql, params, database_id = nil)
    # The SQLite driver returns the names of the columns in the first row. But we want
    # those to go in a hash with explicit names.
    execute_sql_raw(sql, params, database_id) do |db|
      result = db.execute2(sql, params)
      return {
        'columns' => result.first,
        'rows' => result.drop(1)
      }
    end
  end

  # Prepares a properly constructed database object and deals with
  # exceptions that occur during query execution.
  private def execute_sql_raw(sql, params, database_id = nil, read_only = nil)
    database_id = default_database_id if database_id.nil?
    read_only = @read_only if read_only.nil?

    db = sqlite_open_augmented(self.file_path_sqlite(database_id), :read_only => read_only)
    db.execute("PRAGMA foreign_keys = ON")

    # Exceptions that could occur fall in one of two categories
    begin
      yield db
    rescue SQLite3::ConstraintException, SQLite3::SQLException => e
      # Something anticipated went wrong. This is probably the fault
      # of the caller in some way.
      raise DatabaseQueryError.new(self, sql, params, e, false)
    rescue SQLite3::Exception => e
      # Something unanticipated went wrong. We assume this is an error in our
      # implementation (either server or client).
      raise DatabaseQueryError.new(self, sql, params, e, true)
    end
  end

  # Loads all pages that are associated with this project
  def load_pages!
    # Glob all JSON files in the pages folder
    @pages = Dir.glob(File.join(folder_pages,"*.json")).map do |page_file|
      # Each filename contains an ID
      page_id = File.basename(page_file, ".json")
      Page.new(self, page_id, nil)
    end
  end

  # Function to check if project has a table with name table_name
  def has_table(table_name, database_id = nil)
    database_id = default_database_id if database_id.nil?

    return !schema(database_id).detect{|table| table.name.eql? table_name}.nil?
  end

  # All pages that are associated with this project
  def pages
    load_pages! if @pages.nil?
    return (@pages)
  end

  # Retrieves a page by its name
  #
  # @param id The id of the searched page
  def page_by_id(page_id)
    to_return = pages.find {|page| page.id == page_id}
    raise UnknownPageError.new(id, page_id) if to_return.nil?

    return (to_return)
  end

  # Retrieves a page by its name
  #
  # @param name The name of the searched page
  def page_by_name(name)
    to_return = pages.find {|page| page.name == name}
    raise UnknownPageError.new(id, name) if to_return.nil?

    return (to_return)
  end

  # Checks whether a page with a certain name exists
  #
  # @param name The name of the searched page
  def page_by_name?(name)
    pages.any? {|page| page.name == name}
  end

  # @return True, if this project has an index page
  def index_page?
    whole_description.key?('indexPageId')
  end

  # @return The page model for the index page
  def index_page
    # Read the ID of the index page
    page_id = whole_description['indexPageId']
    raise EsqulinoError.new("Project has no index page") if page_id.nil?

    # And return that page
    page_by_id(page_id)
  end

  # @return The API version of this project
  def api_version
    whole_description['apiVersion']
  end

  # Updates the password for a specific user
  #
  # @param username [string] The name of the user
  # @param plain_text_password [string] The password to store
  def set_password(username, plain_text_password)
    # Update the password for the specific user
    users = whole_description.fetch('users', {})
    users[username] = hash_password plain_text_password

    whole_description['users'] = users
  end

  # Verifies whether a given user/pass combo matches a stored combination
  #
  # @param username [string] The name of the user
  # @param plain_text_password [string] The password to verify
  def verify_password(username, plain_text_password)
    # TODO: Bring back actual authentication
    username == "user" and plain_text_password
  end

  # Retrieves the "site" hash that may be used during rendering.
  #
  # @return [Hash] Key-Value pairs that are globally available for this project.
  def render_params
    return {
      'name' => self.whole_description['name'],
      'id' => self.id,
      'description' => self.whole_description['description'],
      'instance' => self,
    }
  end

  # Clones the entire project and makes it available under a new
  # name.
  #
  # @return [Project] The newly created instance
  def clone(new_id)
    new_path = File.realdirpath(File.join(folder, "..", new_id))
    FileUtils.cp_r folder, new_path

    cloned_project = Project.new new_path, true
  end
end

# Enumerates all projects in the given directory
#
# @param projects_dir [string] The path to enumerate
# @param write_access [Boolean] Should the projects be available for writing?
# @param public_only [Boolean] Should only public projects be considered?
def enumerate_projects(projects_dir, write_access, public_only)
  # Not every entry in the projects folder is actually a project
  to_return = Dir
                .entries(projects_dir)
                .select { |entry| entry != '.' and entry != '..' }
                .select { |entry| not entry.start_with? "_"  }
                .map { |entry| File.join projects_dir, entry }
                .select { |entry| File.directory? entry }
                .map { |entry| Project.new entry, write_access }
                .sort { |lhs,rhs| lhs.id <=> rhs.id }

  # Possibly filter out
  if public_only then
    to_return.select { |entry| entry.public? }
  else
    to_return
  end
end

# Generates a salted hash from the given plaintext
# password
#
# @param plain_text_password [string] The password to hash
def hash_password(plain_text_password)
  salt = SCrypt::Engine.generate_salt
  SCrypt::Engine.hash_secret plain_text_password, salt
end

# Available parameters during project creation.
class ProjectCreationParams
  attr_reader :id, :name, :db_type, :admin_name, :admin_password

  def initialize(params_hash)
    @id = params_hash['id']
    @name = params_hash['name']
    @db_type = params_hash['dbType']

    admin_hash = params_hash['admin']
    if not admin_hash.nil? then
      @admin_name = admin_hash['name']
      @admin_password = admin_hash['password']
    end
  end

  # Creates the basic projection description from these creation parameters
  def to_description
    {
      "name" => self.name,
      "description" => "",
      "apiVersion" => '4',
      "public" => false,
      "databases" => {},
      "users" => {}
    }
  end
end


# Creates an entirely new project
#
# @param projects_dir[string] Path to the project storage directory
# @param paroject_params[ProjectCreationParams] Parameters to use for creation
def create_project(projects_dir, project_params)
  # Ensure the project hasn't already been created
  project_path = File.join projects_dir, project_params.id
  if File.exists? project_path
    raise EsqulinoError.new("Project \"#{project_params.id}\" can't be created, it already exists")
  end

  project_description = project_params.to_description

  # From here on we will be touching the filesystem, but in the case
  # of an error there shouldn't be half-baked projects left on the disk
  begin
    Dir.mkdir project_path

    # Create an empty sqlite3 database and incorporate it into
    # the description
    if project_params.db_type == 'sqlite3'
      # Creating folders and files
      project_database_folder = File.join project_path, 'databases'
      project_database_default_path = File.join project_database_folder, 'default.sqlite'
      Dir.mkdir project_database_folder
      SQLite3::Database.new project_database_default_path

      # Referencing the created database in the description
      project_description['databases']['default'] = {
        'type' => 'sqlite3',
        'path' => 'default.sqlite'
      }
    else
      raise EsqulinoError.new "Unknown database type: \"#{project_params.db_type}\" "
    end

    # Default database has now been created
    project_description['activeDatabase'] = 'default'

    # Create a default user
    project_description['users'][project_params.admin_name] = {
      'type' => 'local',
      'password' => hash_password(project_params.admin_password)
    }

    # Write down the actual project configuration
    project_path_config = File.join project_path, 'config.yaml'
    File.open project_path_config, 'w' do |f|
      f.write project_description.to_yaml
    end
  rescue
    # Something went wrong, so we clean up and leave somebody
    # else to react to this
    FileUtils.rm_rf project_path
    raise
  end
end

# Checks whether the given string is a valid Id.
#
# @param [string] maybe_id A string that could be an Id
#
# @return True, if the given string is an Id.
def is_string_id?(maybe_id)
  /^\h{8}-\h{4}-\h{4}-\h{4}-\h{12}$/ === maybe_id
end
