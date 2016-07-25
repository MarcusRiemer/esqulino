# It should be possible for users to define own partials that can be loaded.
# But apart from that partials could also be provided by a server-side plugin
# or simply provided unconditionally.
#
# Therefore this liquid filesystem provide a multi-phase lookup:
#
# 1) Does the project itself contain a matching liquid template?
# 2) Did the project load any plugins that provide templates?
# 3) Is this a globally known template?
class LiquidFilesystem
  # A filesystem is always relative to some project
  def initialize(project)
    @project = project
  end

  # @return The path were global partials are stored.
  def global_partials_path
    File.absolute_path(File.join(@project.folder, "..", "..", "_partials"))
  end

  # @return The path were project partials are stored.
  def project_partials_path
    File.absolute_path(File.join(@project.folder, "_pages"))
  end

  # Retrieves an absolute path to the given template.
  #
  # @param template_path [string] The path to resolve
  #
  # @return [string] An absolute path that could be read.
  def full_path(template_path)
    raise EsqulinoError.new("Invalid nil template") if template_path.nil?
    
    # If the path does not end in .liquid append it
    if File.extname(template_path) != ".liquid"
      template_path += ".liquid"
    end

    search_path = [project_partials_path, global_partials_path]
    
    # Check all possible paths in the following order
    # Project -> Plugin -> Global
    to_return = search_path
                .map { |candidate| File.join(candidate, template_path) }
                .find { |full_path| File.exists? full_path }

    # Missing templates are a serious matter
    raise EsqulinoError.new("Template \"#{template_path}\" not found in #{search_path.inspect}") if to_return.nil?
    
    return (to_return)
  end

  # Reads the given template
  #
  # @param template_path [string] The template path to read
  #
  # @return [string] The template-string
  def read_template_file(template_path)
    File.read(self.full_path template_path)
  end
end

# The rendering process currently assumes that everything has
# been loaded into memory already.
#
# Rendering shouldn't require any state, so this is not a class
# but an ordinary function.
#
# @param project [Project] The project of which a page is going
#                          to be rendered.
# @param page_template [string] The template itself.
# @param params [Hash] Parameters for this render step.
def liquid_render_page(project, page_template, params)
  # Setting up load paths
  # TODO: Is there really no way to do this without manipulating
  #       the global state of the Liquid::Template instance?
  Liquid::Template.file_system = LiquidFilesystem.new(project)
    
  # Load the basic liquid template
  template = Liquid::Template::parse(page_template)

  # Render it alongside the known parameters
  return (template.render(params))
end
