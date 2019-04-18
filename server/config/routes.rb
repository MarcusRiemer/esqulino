Rails.application.routes.draw do
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
          post 'run', controller: 'project_queries', action: :run_arbitrary

          scope 'simulate' do
            post 'insert', controller: 'project_queries', action: :run_simulated_insert
            post 'delete', controller: 'project_queries', action: :run_simulated_delete
          end

          scope ':query_id' do
            post 'run', controller: 'project_queries', action: :run_stored
          end
        end

        # Everything that does something with the pages
        scope 'page' do
          # TODO: Have HTML support again
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
          post 'upload', controller: 'project_databases', action: :database_upload
          get 'download', controller: 'project_databases', action: :database_download
        end
      end
    end

    # Getting the News as JSON
    scope 'news' do
      root via: [:get], controller: 'news', action: :index
      get 'details/:id', controller: 'news', action: :show

      scope 'admin' do
        root via: [:get], controller: 'news', action: :index_admin
        get 'single/:id', controller: 'news', action: :show_admin
      end
    end

    resources :block_languages, only: [:create, :index, :show, :update, :destroy]
    resources :block_language_generators, only: [:create, :index, :show, :update]

    resources :grammars, only: [:create, :index, :show, :update, :destroy]
    get 'grammars/:id/related_block_languages', controller: 'grammars', action: :related_block_languages

    # Access to JSON schema files
    get 'json_schema/:schema_name', controller: 'static_files', action: :schema

    # Generating errors
    get 'raise-error', controller: 'debug', action: :raise_error

    # Fallback for unknown API endpoints
    match '*path', via: :all, to: proc { [404, {}, ["Unknown API endpoint"]] }
  end

  # Third stop:  Serving static files and the index.html on development machines
  # These paths are not meant to be called when running in production
  root action: :index, controller: 'static_files'
  get '*path', action: :index, controller: 'static_files'
end
