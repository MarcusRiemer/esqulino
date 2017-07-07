require_dependency 'render-liquid'

class RenderProjectsController < ApplicationController
  include ProjectsHelper
  
  def favicon
    render status: :not_found
  end

  def render_page
    initial_params = {
      'get' => request.GET,
      'server' => self.server_render_data,
      'project' => self.current_project.render_params,
      'page' => self.current_page.render_params,
    }

    render html: self.current_page.render(initial_params)
  end

  def vendor_file
    basepath = Rails.configuration.sqlino[:client_dir]
    local_path = File.join basepath, 'vendor', params['path']
    send_file local_path, disposition: 'inline'
  end

  def run_query
    begin
      # request_prepare_project subdomain
      # request_prepare_page(page_name_or_id, true)

      # Grab all "naked" POST-parameters
      input_params = {}
      request.POST
        .select {|key,value| not key.include? '.' }
        .each {|key,value| input_params[key] = value }

      # Put them in the "grand" request object
      # Doing the same for hidden "get" inputs
      form_get_params = {}
      request.POST
        .select {|key,value| key.start_with? "get" and not value.strip.empty?}
        .each {|key,value| form_get_params[key[4..-1]] = value }

      bind_params = form_get_params.merge(input_params)

      initial_params = {
        'request' => input_params,
        'get' => form_get_params,
        'project' => self.current_project.render_params,
        'page' => self.current_page.render_params,
        'server' => self.server_render_data
      }

      # GET-parameters denote a mapping
      request.GET.each do |parameter_name, providing_name|
        # Does the providing name have a prefix?
        if providing_name.include? '.'
          # Yes, properly split it up to map something
          providing_prefix, providing_name = providing_name.split "."

          # And do the actual mapping
          begin
            mapped_value = initial_params
                             .fetch(providing_prefix)
                             .fetch(providing_name)
            bind_params[parameter_name] = mapped_value
          rescue KeyError => e
            # For the moment we simply let them be,
            # query.executeable? does the real checking of required parameters.
          end
        else
          bind_params[parameter_name] = bind_params[providing_name]
          bind_params.delete providing_name
        end
      end

      # Grab the query reference and execute it
      query = self.current_project.query_by_id params['query_id']
      query.execute(bind_params)

      # Go back
      redirect_back(fallback_location: '/')
    rescue EsqulinoError => e
      initial_params['exception'] = e.to_liquid
      status e.code
      liquid_render_path(@project, "exception", initial_params)
    end
  end

  # This is data that is provided for the templates by the server.
  # It does not depend on the project or the currently active page
  def server_render_data
    return {
      'editor_host' => ENV['ESQULINO_EDITOR_HOST'] || 'localhost.localdomain:3000'
    }
  end

  # Extracts the project id from the request.
  def request_project_id
    request.subdomain
  end

  # Retrieves
  def current_project
    super(self.request_project_id)
  end

  def current_page
    super(params['page_name_or_id'], true)
  end
end
