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
  def render(context)
    if context['sources'].nil?
      context['sources'] = []
    end

    uuid = context['uuid']

    id_suffix = $sourceList[uuid].count(context['src'])

    $sourceList[uuid] << (context['src'])

    <<-delim
<picture>
  <source media="(min-width: 2000px)" srcset="/image/#{ context['src'] }">
  <source media="(min-width: 1600px)" srcset="/image/#{ context['src'] }?width=2000">
  <source media="(min-width: 1200px)" srcset="/image/#{ context['src'] }?width=1600">
  <source media="(min-width:  800px)" srcset="/image/#{ context['src'] }?width=1200">
  <source media="(min-width:  400px)" srcset="/image/#{ context['src'] }?width=800">
  <img id="#{context['src']}-#{id_suffix}" src="/image/#{ context['src'] }?width=400" alt="#{ context['alt'] }">
</picture>
    delim
  end
end


Liquid::Template.register_tag('addToSourceList', AddToSourceList)

class DisplaySourceList < Liquid::Tag
  def render(context)
    sources = $sourceList[context['uuid']].map do |image_id|
      Image.new(context['project']['instance'], image_id).metadata_show
    end

    sources_grouped = sources.reduce(Hash.new { |hash, key| hash[key] = Hash.new{ |h,k| h[k] = {} } }) do |hash, source|
      author_key = source.slice(*%w[author-name author-url])
      author = hash[author_key]
      licence_key = source.slice(*%w[licence-name licence-url])
      image = source.slice(*%w[name])

      licence = author[licence_key]

      if existing_image = licence[source['id']]
        existing_image['count'] += 1
      else
        licence[source['id']] = image
        licence[source['id']]['count'] = 1
      end

      hash
    end

    context.merge({'sources_grouped' => sources_grouped})
    nil
  end
end

Liquid::Template.register_tag('displaySourceList', DisplaySourceList)

class DisplayImageFigure < Liquid::Tag
  def render(context)
    img = Image.new(context['project']['instance'], context['src'])
    metadata = img.metadata_show

    <<-delim
<figure class="figure">
  <picture>
    <source media="(min-width: 2000px)" srcset="/image/#{ context['src'] }">
    <source media="(min-width: 1600px)" srcset="/image/#{ context['src'] }?width=2000">
    <source media="(min-width: 1200px)" srcset="/image/#{ context['src'] }?width=1600">
    <source media="(min-width:  800px)" srcset="/image/#{ context['src'] }?width=1200">
    <source media="(min-width:  400px)" srcset="/image/#{ context['src'] }?width=800">
    <img id='#{context['src']}' class="figure-img" src='/image/#{ context['src'] }?width=400'>
  </picture>
  <footer><small>
    <a href='#{metadata['author-url']}'>#{ metadata['author-name'] }</a>,
    <a href='#{metadata['licence-url']}'>#{metadata['licence-name']}</a>
  </small></footer>
  <figcaption class="figure-caption">#{ metadata['name'] }</figcaption>
</figure>
    delim
  end
end

Liquid::Template.register_tag('imageFigure', DisplayImageFigure)

#4c724484-017d-48a7-848f-3694ae3b4681
UUID_REGEX = /^[[:xdigit:]]{8}-[[:xdigit:]]{4}-4[[:xdigit:]]{3}-[[:xdigit:]]{4}-[[:xdigit:]]{12}$/

class TableCell < Liquid::Tag
  def initialize(tag_name, value, tokens)
    super
    @value = value
  end

  def render(context)
    scopes = context.scopes
    colLoopScope = scopes[0]
    colName = colLoopScope['name']
    rowLoopScope = scopes[1]
    value = rowLoopScope['row'][colName]
    if value =~ UUID_REGEX
    #TODO get rid of code duplication
      if context['sources'].nil?
        context['sources'] = []
      end

      uuid = context['uuid']

      id_suffix = $sourceList[uuid].count(value)

      $sourceList[uuid] << (value)

      <<-delim
<picture>
  <source media="(min-width: 2000px)" srcset="/image/#{value}">
  <source media="(min-width: 1600px)" srcset="/image/#{value}?width=2000">
  <source media="(min-width: 1200px)" srcset="/image/#{value}?width=1600">
  <source media="(min-width:  800px)" srcset="/image/#{value}?width=1200">
  <source media="(min-width:  400px)" srcset="/image/#{value}?width=800">
  <img id="#{value}-#{id_suffix}" src="/image/#{value}?width=400">
</picture>
    delim
    else
      value
    end
  end
end

Liquid::Template.register_tag('tableCell', TableCell)

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
