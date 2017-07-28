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

    if File.exists? local_path then
      send_file local_path, disposition: 'inline'
    else
      render status: :not_found
    end
  end

  def run_query
    begin
      # Grab the query reference and execute it
      query = self.current_project.query_by_id params['query_id']
      query.execute(request.POST)

      # Go back
      redirect_back(fallback_location: '/')
    rescue EsqulinoError => e
      initial_params = {
        'get' => request.GET,
        'post' => request.POST,
        'server' => self.server_render_data,
        'project' => self.current_project.render_params,
        'page' => self.current_page.render_params,
        'exception' => e.to_liquid
      }

      render status: e.code, html: self.current_page.render(initial_params)
    end
  end

  # This is data that is provided for the templates by the server.
  # It does not depend on the project or the currently active page
  def server_render_data
    return {
      'editor_host' => ENV['ESQULINO_EDITOR_HOST'] || 'localhost.localdomain:9292'
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
