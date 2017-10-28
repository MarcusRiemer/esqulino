# All actions that concern pages that are part of a project
class ProjectPagesController < ApplicationController
  include ProjectsHelper

  # Create a new page
  def create
    @current_page = Page.new current_project, nil
    self.update
  end

  # Update an existing page
  def update
    ensure_write_access do
      # TODO: Validate
      # new_page = @@validator.ensure_request("PageUpdateRequestDescription", request.body.read)
      new_page = JSON.parse request.body.read

      # Store the new model
      current_page.model = new_page['model']
      current_page.save!

      # Store all templates
      current_page.save_templates new_page['sources']

      render status: 200, json: current_page.id
    end
  end

  # Deleting a page
  def destroy
    ensure_write_access do
      current_page.delete!

      # Was this the index page? Then remove it from the description
      current_project.check_index_page!
      current_project.save_description

      render status: 200
    end
  end

  # Rendering an arbitrary page
  def render_arbitrary
    # Ensure this request is shaped as we would expect it
    # TODO: Validate
    # render_request = @@validator.ensure_request("PageRenderRequestDescription", request.body.read)
    render_request = JSON.parse request.body.read

    # The known parameters for this request
    params = render_request['params']
    params['get'] = request.GET
    params['server'] = self.server_render_data

    # Queries are Hashes of the form { sql :: string, name :: string }
    queries = render_request['queries']

    page_template = render_request['source']
    render_engine = render_request['sourceType']

    # This page is not stored on the server, we construct it in memory
    page = Page.new(self.current_project, nil, render_request['page'])

    # Enrich parameters with query data
    render :html => page.render(params, render_engine, page_template)
  end

  # Rendering a known page
  def render_known
    initial_params = {
        'get' => request.GET,
        'server' => self.render_server_data
    }
    puts "INITIAL_PARAMS"
    p initial_params
    render html: self.current_page.render(initial_params)
  end

  def server_render_data
    return {
      'editor_host' => Rails.configuration.sqlino['editor_domain'],
      'project_host' => Rails.configuration.sqlino['project_domains'][0]
    }
  end
end
