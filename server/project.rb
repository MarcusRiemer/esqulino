require 'json'
require 'yaml'
require 'securerandom' # To generate UUIDs
require 'fileutils'    # To create directory trees
require 'scrypt'

require './project/query.rb'
require './project/page.rb'

# Represents an esqulino project. Attributes of this
# class are loaded lazily on demand, so there is no harm
# in creating loads of instances.
class Project
  # @param project_folder [string] The projects root folder
  # @param write_access [Boolean] True, if this project should be openend in read-only mode
  def initialize(project_folder, write_access)
    @project_folder = project_folder
    @whole_description = nil
    @schema = nil
    @pages = nil
    @queries = nil
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

  # The path to the currently active SQLite database
  def file_path_sqlite
    # Check whether the description of this project specifies an alternate
    # database file to use.
    database_file_name = whole_description.fetch('database', 'default.sqlite')
    
    File.join(self.folder_databases, database_file_name)
  end

  # @return The id of this project
  def id
    File.basename @project_folder
  end

  # @return True, if at least the project folder and a model file exist
  def exists?
    File.directory? @project_folder and File.exists? description_filename
  end

  # Throws if the project was openend without write_access
  def assert_write_access!
    raise AuthorizationError.new "Project opened without write access!" unless @write_access
  end

  # Loads all parts of the model that have not been loaded so far. This
  # does explicitly not reload parts that have been loaded already!
  def load!
    load_description! if @whole_description.nil?
    load_schema! if @schema.nil?
    load_pages! if @pages.nil?
    load_queries! if @queries.nil?
  end

  # Turn a project into a JSON description
  def to_json(options)
    # The JSON representation is always meant to be complete
    load!

    # Enrich the description itself with the more complex attributes
    @whole_description.merge(
      {
        :schema => @schema,
        'availableDatabases' => self.available_databases,
        :queries => @queries,
        :pages => @pages,
        :id => self.id
      }
    ).to_json(options)
  end

  # @return The path to the file that stores the project model
  def description_filename
    File.join(@project_folder, "config.yaml")
  end
  
  # Loads the projects model from disk
  def load_description!
    # Ensure this is actually a loadable project
    raise UnknownProjectError.new(id) unless self.exists?
    @whole_description = YAML.load_file(description_filename);
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
        puts "Removing reference to index page"
        @whole_description.delete 'indexPageId'
        puts @whole_description.to_s
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
    to_return['preview'] = whole_info['preview']
    to_return['indexPageId'] = whole_info['indexPageId']
    to_return['apiVersion'] = whole_info['apiVersion']

    return to_return;
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
  def load_schema!
    @schema = database_describe_schema(self.file_path_sqlite)
  end

  # Information about the structure of the database
  def schema
    load_schema! if @schema.nil?
    return (@schema)
  end

  # @return A list of all databases that are available to this project
  def available_databases
    Dir.glob(File.join(self.folder_databases, "*.sqlite")).map(&File.method(:basename))
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

  # Executes a query in the context of this project. This is of course
  # a major security concern and shouldn't be done lightly.
  #
  # @param sql [string] The SQL query
  # @param params [Hash] Query parameters
  #
  # @return [Hash] { columns :: List, rows :: List of List }
  #                
  def execute_sql(sql, params)
    db = SQLite3::Database.new(self.file_path_sqlite, :read_only => @read_only)
    db.execute("PRAGMA foreign_keys = ON")

    begin
      # execute2 returns the names of the columns in the first row. But we want
      # those to go in a hash with explicit names.
      result = db.execute2(sql, params)
      return {
        'columns' => result.first,
        'rows' => result.drop(1)
      }
    rescue SQLite3::ConstraintException, SQLite3::SQLException => e
      raise DatabaseQueryError.new(self, sql, params, e)
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

  # All pages that are associated with this project
  def pages
    load_pages! if @pages.nil?
    return (@pages)
  end

  # Retrieves a page by its name
  #
  # @param id The id of the searched page
  def page_by_id(id)
    to_return = pages.find {|page| page.id == id}
    raise UnknownPageError.new(id, name) if to_return.nil?

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
    # Salt & hash the password
    salt = SCrypt::Engine.generate_salt
    password = SCrypt::Engine.hash_secret plain_text_password, salt

    # Store it in the model
    users = whole_description.fetch('users', {})
    users[username] = password
    whole_description['users'] = users
  end

  # Verifies whether a given user/pass combo matches a stored combination
  #
  # @param username [string] The name of the user
  # @param plain_text_password [string] The password to verify
  def verify_password(username, plain_text_password)
    begin
      # Load the password
      stored_hash = whole_description.fetch('users').fetch(username)
      password = SCrypt::Password.new(stored_hash)

      password == plain_text_password
    rescue KeyError => e
      raise AuthorizationError.new
    end
  end

  # Retrieves the "site" hash that may be used during rendering.
  #
  # @return [Hash] Key-Value pairs that are globally available for this project.
  def render_params
    return {
      'name' => self.whole_description['name'],
      'id' => self.id,
      'description' => self.whole_description['description'],
    }
  end
end

# Enumerates all projects in the given directory
#
# @param projects_dir [string] The path to enumerate
# @param write_access [Boolean] Should the projects be available for writing?
def enumerate_projects(projects_dir, write_access)
  Dir.entries(projects_dir)
    .select { |entry| entry != '.' and entry != '..' and not entry.start_with? "_" }
    .map { |entry| Project.new File.join(projects_dir, entry), write_access }
end

# Checks whether the given string is a valid Id.
#
# @param [string] maybe_id A string that could be an Id
#
# @return True, if the given string is an Id.
def is_string_id?(maybe_id)
  /^\h{8}-\h{4}-\h{4}-\h{4}-\h{12}$/ === maybe_id
end

