require 'json'
require 'yaml'
require 'securerandom' # To generate UUIDs
require 'fileutils'    # To create directory trees

require './project/query.rb'
require './project/page.rb'

# Throws an exception if the given folder is not a valid
# esqulino project.
#
# @param project_folder [string] The projects root folder
def assert_project_dir(project_folder, project_id)
  
  if not File.directory? project_folder
    raise UnknownProjectError, project_id
  end
  
  project_config_file = File.join(project_folder, "config.yaml")
  if not File.exists? project_config_file
    raise UnknownProjectError, project_id
  end
end

# Strips information from a project description that is not meant to be
# public. Technically this works by copying over a subset of properties
# that are known, so unknown properties will *always* get stripped. Or
# to put it in simpler terms: This approach uses a whitelist, you can't
# add arbitrary fields to the projects description and hope that they
# will be visible on the client.
#
# @param whole_info [Hash] The whole JSON / YAML structure
#
# @return [Hash] The filtered JSON / YAML structure
def project_public_info(whole_info)
  to_return = {}

  to_return['name'] = whole_info['name']
  to_return['description'] = whole_info['description']
  to_return['id'] = whole_info['id']
  to_return['preview'] = whole_info['preview']
  to_return['indexPageId'] = whole_info['indexPageId']

  return to_return;
end

# Loads a project from disk
#
# @param project_folder [string] The projects root folder
#
# @return [Hash] The whole project, including schema, pages and queries
def read_project(project_folder)
  # Load data from disk and strip any private data
  project = YAML.load_file(File.join(project_folder, "config.yaml"));
  project = project_public_info(project);
  
  # Put the schema into it
  project['schema'] = database_describe_schema(project_folder)
  
  # Load all related queries and pages
  project['queries'] = project_load_queries(project_folder)
  project['pages'] = project_load_pages(project_folder)
  
  return (project)
end

# Updates the project at the given path with the information found
# in the given description.
#
# @param project_folder [string] The projects root folder
#
# @return [string] The id of the project
def update_project_description(project_folder, updated_project)
  # Load project from disk
  project_filename = File.join(project_folder, "config.yaml")
  project = YAML.load_file(project_filename);

  # Override properties from this project with properties from the
  # updated project.
  to_store = project.merge(updated_project)

  File.open(project_filename, "w") do |f|
    f.write(to_store.to_yaml)
  end

  return (to_store['id'])
end

# Checks whether the given string is a valid Id.
#
# @param [string] A string that could be an Id
#
# @return True, if the given string is an Id.
def is_string_id?(maybe_id)
  /^\h{8}-\h{4}-\h{4}-\h{4}-\h{12}$/ === maybe_id
end

