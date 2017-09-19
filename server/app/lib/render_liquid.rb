require 'liquid'
require 'securerandom'

require_dependency 'image'

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

# The context passed to the render functions by liquid
# does not pass a modified context to the next render call,
# instead each render call gets its own context, therefore
# the source list can not be passed through the rendering
# chain inside the context. Therefore this global Hash is used.
# To avoid concurrency issues with caused by multiple rendering
# runs for different requests on different threads each request
# generates a uuid and uses it as a key to store its source list
# inside the hash.
$sourceList = Hash.new

class AddToSourceList < Liquid::Tag
  def initialize(tag_name, param, tokens)
    super
  end

  def render(context)
    if context['sources'].nil?
      context['sources'] = []
    end

    uuid = context['uuid']

    id_suffix = $sourceList[uuid].count(context['src'])

    $sourceList[uuid] << (context['src'])

    "<img id='#{context['src']}-#{id_suffix}' src='/image/#{ context['src'] }' alt='#{ context['alt'] }'>"
  end
end

Liquid::Template.register_tag('addToSourceList', AddToSourceList)

class DisplaySourceList < Liquid::Tag
  def initialize(tag_name, param, tokens)
    super
  end

  def render(context)
    sources = []

    for image_id in $sourceList[context['uuid']] do
      img = Image.new(context['project']['instance'], image_id)
      metadata = img.metadata_show
      sources << metadata
    end

    #group sources by author
    grouped_by_author = sources.group_by { |entry| { 'author-name' => entry['author-name'], 'author-url' => entry['author-url']} }

    #group content of the groups by image id
    double_grouped = grouped_by_author.map { | k, v| { k => ((v.group_by { |entry| { 'id' => entry['id'], 'name' => entry['name'] } }) ).map { |key, val| { key => { 'data' => val[0], 'count' => val.count } } } } }

    #merge into single hash
    double_grouped = double_grouped.reduce({}) { |h1, h2| h1.merge(h2) }

    context.merge({'sources_grouped' => double_grouped})
    nil
  end
end

Liquid::Template.register_tag('displaySourceList', DisplaySourceList)

class DisplayImageFigure < Liquid::Tag
  def initialize(tag_name, param, tokens)
    super
  end

  def render(context)
    img = Image.new(context['project']['instance'], context['src'])
    metadata = img.metadata_show

    <<-delim
<figure class="figure">
  <img id='#{context['src']}' class="figure-img" src='/image/#{ context['src'] }'>
  <figcaption class="figure-caption text-right">
    #{ metadata['name'] } von <a href='#{metadata['author-url']}'>#{ metadata['author-name'] }</a>, Lizenz: <a href='\#'>#{ "TODO" }</a>
  </figcaption>
</figure>
    delim
  end
end

Liquid::Template.register_tag('imageFigure', DisplayImageFigure)

def liquid_render_path(project, page_file, params)
  liquid_render_page(project, "{% include \"#{page_file}\" %}", params)
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

#  params["source"]

#  # puts "Rendering with params #{params.inspect}"
#  def imgidpipe(imgid)
#    params["source"] << imgid
#    imgid
#  end

  # Render it alongside the known parameters
  params['uuid'] = SecureRandom.uuid
  $sourceList[params['uuid']] = []
  res = (template.render(params))
  $sourceList.except!(params['uuid'])
  return res
end
