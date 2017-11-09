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

# Generates the URL for an image
#
# @param context liquid render context as passed to a liquid tags render function
# @param id UUID of the image, if nil context['src'] is used instead
def generate_image_url(context, id)
  authority = "#{context['project']['id']}.#{context['server']['project_host']}"
  "//#{authority}/image/#{ id || context['src'] }"
end

# Represets Pairs of mid-width selector values and requested image width
# width may be nil
Limit = Struct.new(:min_width, :width)

# Generates the HTML Picture Element with a source for every limit in limits
#
# @param url base url for the full size image
# @param limits list of Limit structs
def generate_picture(url, limits, smallest_width, id, alt, cssclass)
  <<-delim
<picture>
  #{limits.map{ |limit|
"<source media='(min-width: #{limit.min_width}px)'
srcset='#{url}#{
  if limit.width.nil? then '' else "?width=#{limit.width}" end
}'>"
}.join("\n")}
  <img id="#{id}"
       class="#{cssclass}"
       src="#{url}?width=#{smallest_width}"
       alt="#{alt}">
</picture>
  delim
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

#Liquid tag for rendering an icon and adding it to the source list
class AddToSourceList < Liquid::Tag
  def render(context)
    if context['sources'].nil?
      context['sources'] = []
    end

    uuid = context['uuid']

    id_suffix = $sourceList[uuid].count(context['src'])

    $sourceList[uuid] << (context['src'])
    url = generate_image_url(context, nil)

    limits = [
      Limit.new(2000,  nil),
      Limit.new(1600, 2000),
      Limit.new(1200, 1600),
      Limit.new( 800, 1200),
      Limit.new( 400,  800)
    ]
    generate_picture(url, limits, 400, "#{context['src']}-#{id_suffix}", context['alt'], "")
  end
end


Liquid::Template.register_tag('addToSourceList', AddToSourceList)

#Liquid tag for rendering the source list
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

#Liquid tag for rendering image figures
class DisplayImageFigure < Liquid::Tag
  def render(context)
    img = Image.new(context['project']['instance'], context['src'])
    metadata = img.metadata_show
    url = generate_image_url(context, nil)

    limits = [
      Limit.new(2000,  nil),
      Limit.new(1600, 2000),
      Limit.new(1200, 1600),
      Limit.new( 800, 1200),
      Limit.new( 400,  800)
    ]

    <<-delim
<figure class="figure">
  #{ generate_picture(url, limits, 400, context['src'], metadata['name'], "figure-img") }
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

#Liquid tag for rendering UUIDs in table cells as icons
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
      url = generate_image_url(context, value)

      limits = [
        Limit.new(2000,  nil),
        Limit.new(1600, 1000),
        Limit.new(1200, 800),
        Limit.new( 800, 600),
        Limit.new( 400,  400)
      ]

      generate_picture(url, limits, 200,"#{value}-#{id_suffix}", "", "")
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

  # Render it alongside the known parameters
  params['uuid'] = SecureRandom.uuid
  $sourceList[params['uuid']] = []
  res = (template.render(params))
  $sourceList.except!(params['uuid'])
  return res
end
