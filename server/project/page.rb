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

# Loads a single project with a known ID.
#
# @param project_folder [string] The projects root folder
# @param page_id_or_file [string] The id of the page or the
#                                 path to the whole file.
#
# @return [Hash] All properties of a page
def project_load_page(project_folder, page_ref)
  # Distinguish between paths and Ids
  if File.exists? page_ref then
    page_id = File.basename(page_ref, ".json")
    page_file = page_ref
  elsif is_string_id? page_ref then
    page_id = page_ref
    page_folder = File.join(project_folder, "pages")
    page_file = File.join(page_folder, "#{page_id}.json")
  else
    raise UnknownPageError.new(page_ref)
  end

  # Load the model from disk
  page_model = YAML.load_file(page_file)

  # Put the id into the model, which is part of the filename
  page_model['id'] = page_id

  return page_model
end

# Retrieves all pages that are part of the given project.
#
# @param project_folder [string] The projects root folder
#
# @return [List] A list of "over the wire" descriptions of pages
def project_load_pages(project_folder)
  page_folder = File.join(project_folder, "pages")
  Dir.glob(page_folder + "/*.json").map do |page_file|
    project_load_page(project_folder, page_file)
  end
end

# Loads the template for a given page
#
# @param project_folder [string] The projects root folder
# @param page_id [string] The ID of the page
# @param template_type [string]
def project_load_page_template(project_folder, page_id, template_type)
  # Todo: Work with more then one template engine
  raise EsqulinoError.new("Unknown template type \"#{template_type}\"") if template_type != "liquid"
  template_extension = "liquid"
  
  page_folder = File.join(project_folder, "pages")
  template_file = File.join(page_folder, "#{page_id}.#{template_extension}")

  return (File.read(template_file))
end

# Stores a given page in the context of a given project. For the moment
# this requires the client to provide the rendered HTML string, because
# the implementation of that serialization step is written in Typescript.
#
# @param project_folder [string] The projects root folder
# @param page_info [Hash] The page model and it's HTML representation.
# @param given_page_id [string] The id of the page to store
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

# Gather all things from disk that are required to render a page
# and then actually renders it.
#
# @param project_folder [string] The projects root folder
# @param given_page_id [string] The id of the page to render
def project_render_stored_page(project_folder, page_id)
  page_model = project_load_page(project_folder, page_id)

  return project_render_page_template(project_folder, page_model,
                                      "liquid", [], {})
end


#
# @param project_folder [string] The projects root folder
# @param render_engine The render engine to use
def project_render_page_template(project_folder,
                                 page_model,
                                 render_engine,
                                 query_models,
                                 params)
  template_string = project_load_page_template(project_folder,
                                               page_model['id'],
                                               render_engine)

  template = Liquid::Template::parse(template_string)

  return (template.render())
end
