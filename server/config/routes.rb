# This constraint kicks in for every project subdomain that should
# be rendered.
class RenderProjectConstraint
  def project_domains
    Rails.configuration.sqlino[:project_domains] || []
  end

  # True, if the request in question probably is a project
  def matches?(request)
    (self.project_domains.include? request.domain) or not(['', 'www', 'mri-tp'].include? request.subdomain)
  end
end

Rails.application.routes.draw do
  # First stop: We might need to render a project for an end user
  constraints RenderProjectConstraint.new do
    root via: [:get, :post], controller: 'render_projects', action: :render_page

    # TODO: find out how to represent this with a single route
    get '*path/favicon.ico', controller: 'render_projects', action: :favicon
    get '/favicon.ico', controller: 'render_projects', action: :favicon

    # Catch all requests for static files that are provided upstream
    get '/vendor/*path', format: false, controller: 'render_projects', action: :vendor_file

    get 'image/:image_id', controller: 'render_projects', action: :file_show

    # Running a query
    post '/(:page_name_or_id/)query/:query_id', controller: 'render_projects', action: :run_query

    # We assume these are pages
    match '*page_name_or_id', via: [:get, :post], controller: 'render_projects', action: :render_page
  end

  # Second stop: The API for the editor
  scope '/api' do
    # Everything in the context of projects
    scope 'project' do
      root via: [:get], controller: 'projects', action: :index
      root via: [:post], controller: 'projects', action: :create
      root via: [:delete], controller: 'projects', action: :destroy

      # Everything that does something in the context of a specific project
      scope ':project_id' do
        root controller: 'projects', action: :show
        root via: [:put], controller: 'projects', action: :update
        root via: [:delete], controller: 'projects', action: :destroy

        get 'preview', controller: 'projects', action: :preview_image

        resources :code_resources, only: [:create, :update, :destroy], param: "code_resource_id"

        # Everything that does something with the database content via a query
        scope 'query' do
          root via: [:post], controller: 'project_queries', action: :create
          post 'run', controller: 'project_queries', action: :run_arbitrary

          scope 'simulate' do
            post 'insert', controller: 'project_queries', action: :run_simulated_insert
            post 'delete', controller: 'project_queries', action: :run_simulated_delete
          end

          scope ':query_id' do
            root via: [:post], controller: 'project_queries', action: :update
            root via: [:delete], controller: 'project_queries', action: :destroy
            post 'run', controller: 'project_queries', action: :run_stored
          end
        end

        # Everything that does something with the pages
        scope 'page' do
          root via: [:post], controller: 'project_pages', action: :create
          post 'render', controller: 'project_pages', action: :render_arbitrary

          scope ':page_id' do
            root via: [:post], controller: 'project_pages', action: :update
            root via: [:delete], controller: 'project_pages', action: :destroy

            get 'render', controller: 'project_pages', action: :render_known
          end
        end

        # Everything that has something to do with images
        scope 'image' do
          root via: [:get], controller: 'project_images', action: :list_show
          root via: [:post], controller: 'project_images', action: :create

          scope ':image_id' do
            root via: [:get], controller: 'project_images', action: :file_show
            root via: [:post], controller: 'project_images', action: :file_update
            root via: [:delete], controller: 'project_images', action: :file_delete

            get  'metadata', controller: 'project_images', action: :metadata_show
            post 'metadata', controller: 'project_images', action: :metadata_update
          end
        end

        # Everything that does something with the database schema
        scope 'db/:database_id' do
          get 'visual_schema', controller: 'project_databases', action: :visual_schema

          # Manipulation via tabular data (like CSV files)
          post 'data/:tablename/bulk-insert', controller: 'project_databases', action: :table_tabular_insert

          # Querying table data
          get 'count/:tablename', controller: 'project_databases', action: :table_row_count
          get 'rows/:tablename/:from/:amount', controller: 'project_databases', action: :table_row_data

          # Altering the schema
          post 'alter/:tablename', controller: 'project_databases', action: :table_alter
          delete 'drop/:tablename', controller: 'project_databases', action: :table_delete
          post 'create', controller: 'project_databases', action: :table_create
        end
      end
    end

    resources :block_languages, only: [:create, :index, :show, :update, :destroy]
    resources :block_language_generators, only: [:create, :index, :show, :update]

    resources :grammars, only: [:create, :index, :show, :update, :destroy]
    get 'grammars/:id/related_block_languages', controller: 'grammars', action: :related_block_languages

    get 'schema/:schema_name', controller: 'static_files', action: :schema

    # Fallback for unknown API endpoints
    match '*path', via: :all, to: proc { [404, {}, ["Unknown API endpoint"]] }
  end

  # Third stop:  Serving static files and the index.html on development machines
  # These paths are not meant to be called when running in production
  root action: :index, controller: 'static_files'
  get '*path', action: :index, controller: 'static_files'
end
