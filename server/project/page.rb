# Throws an exception if the given page does not exist.
#
# @param project_folder [string] The projects root folder
# @param project_id [string] The ID of the project
# @param page_id [string] The ID of the page
def assert_page(project_folder, project_id, page_id)
  page_folder = File.join(project_folder, "pages")

  if not File.exists? File.join(page_folder, page_id + ".json")
    raise UnknownQueryError.new(project_id, page_id)
  end
end


# Retrieves all pages that are part of the given project.
#
# @param project_folder [string] The projects root folder
#
# @return [List] A list of "over the wire" descriptions of pages
def project_load_pages(project_folder)
  to_return = []

  page_folder = File.join(project_folder, "pages")
  Dir.glob(page_folder + "/*.json").each do |page_file|
    # Load the model from disk
    page_model = YAML.load_file(page_file)

    # Put the id into the model, which is part of the filename
    page_model['id'] = File.basename(page_file, ".json")

    # Append it to the list of values that should be returned
    to_return << page_model
  end

  return to_return
end

# Stores a given page in the context of a given project. For the moment
# this requires the client to provide the rendered HTML string, because
# the implementation of that serialization step is written in Typescript.
#
# @param project_folder [string] The projects root folder
# @param page_info [Hash] The page model and it's HTML representation.
# @param given_page_id [string] The id of this page
#
# @return The id of the stored query
def project_store_page(project_folder, page_info, given_page_id)
  page_folder = File.join(project_folder, "pages")

  # Ensuring that the project folder has a "pages" subfolder
  if not File.directory?(page_folder)
    FileUtils.mkdir_p(page_folder)
  end

  # Possibly generate a new page id
  page_id = given_page_id || SecureRandom.uuid
  
  # Filename with various extensions
  page_filename = File.join(page_folder, page_id)
  page_filename_json = page_filename + ".json"

  File.open(page_filename_json, "w") do |f|
    f.write(page_info['model'].to_json)
  end

  # Delete a possibly existing rendered files. We prefer having 
  # no string representation at all instead of silently working
  # with an older state of the page.
  Dir.glob(page_filename + ".*") do |page_filename_rendered|
      File.delete page_filename_rendered if not page_filename_rendered == page_filename_json
  end

  # Are rendered strings part of the information?
  if page_info.has_key? 'sources' then    
    # Yes, simply store them
    page_info['sources'].each do |key,value|
      File.open(page_filename + "." + key, "w") do |f|
        f.write(value)
      end
    end
  end

  return page_id
end
