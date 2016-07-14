require 'json'
require 'yaml'
require 'securerandom' # To generate UUIDs
require 'fileutils'    # To create directory trees

require './project/query.rb'
require './project/page.rb'

# Represents an esqulino project. Almost all attributes of this
# class are loaded lazily on demand.
class Project
  # @param project_folder [string] The projects root folder
  def initialize(project_folder)
    @project_folder = project_folder
    @whole_description = nil
    @schema = nil
    @pages = nil
    @queries = nil
  end

  def folder
    @project_folder
  end

  # @return True, if at least the project folder and a model file exist
  def exists?
    File.directory? @project_folder and File.exists? description_filename
  end

  # Loads the whole model at once
  def load!
    load_description! if @whole_description.nil?
    load_schema! if @schema.nil?
    load_pages! if @pages.nil?
    load_queries! if @queries.nil?
  end

  def to_json(options)
    # The JSON representation is always meant to be complete
    load!

    # Enrich the description itself with the more complex attributes
    @whole_description.merge({
      :schema => @schema,
      :queries => @queries,
      :pages => @pages
    }).to_json(options)
  end

  # @return The path to the file that stores the project model
  def description_filename
    File.join(@project_folder, "config.yaml")
  end
  
  # Loads the projects model from disk
  def load_description!
    @whole_description = YAML.load_file(description_filename);
    puts @whole_description
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

    @whole_description = @whole_description.merge new_model
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
    raise EsqulinoError, "Attempted to save unloaded project" if @whole_description.nil?
    
    File.open(description_filename, "w") do |f|
      f.write(@whole_description.to_yaml)
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
    to_return['id'] = whole_info['id']
    to_return['preview'] = whole_info['preview']
    to_return['indexPageId'] = whole_info['indexPageId']

    return to_return;
  end

  # @return The id of this project
  def id
    load_description! if @whole_description.nil?
    return (@whole_description['id'])
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
    @schema = database_describe_schema(@project_folder)
  end

  # Information about the structure of the database
  def schema
    load_schema! if @schema.nil?
    return (@schema)
  end

  # Loads all queries that are associated with this project
  def load_queries!
    @queries = project_load_queries(@project_folder)
  end

  # All queries that are associated with this project
  def queries
    load_queries! if @queries.nil?
    return (@queries)
  end

  # Loads all pages that are associated with this project
  def load_pages!
    @pages = project_load_pages(@project_folder)
  end

  # All queries that are associated with this project
  def pages
    load_pages! if @pages.nil?
    return (@pages)
  end
end

# Checks whether the given string is a valid Id.
#
# @param [string] A string that could be an Id
#
# @return True, if the given string is an Id.
def is_string_id?(maybe_id)
  /^\h{8}-\h{4}-\h{4}-\h{4}-\h{12}$/ === maybe_id
end

