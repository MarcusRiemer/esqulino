Rails.application.routes.draw do
  scope '/api' do
    scope 'project' do
      root controller: 'projects', action: :index

      scope ':project_id' do
        root controller: 'projects', action: :show
        root via: [:post], controller: 'projects', action: :edit
        root via: [:delete], controller: 'projects', action: :destroy
        
        get 'preview', controller: 'projects', action: :preview_image

        # Everything that does something with the database content via a query
        scope 'query' do
          root via: [:post], controller: 'project_queries', action: :create
          post 'run', controller: 'project_queries', action: :run_arbitrary

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
          end
        end

        # Everything that does something with the database schema
        scope 'db/:database_id' do
          get 'visual_schema', controller: 'project_databases', action: :visual_schema

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

    # Fallback for unknown API endpoints
    match '*', via: [:get, :post], to: proc { [404, {}, ["Unknown API endpoint"]] }
  end

  # Serving static files and the index.html on development machines
  # These paths are not meant to be called when running in production
  get '*path', action: :index, controller: 'static_files'
  root action: :index, controller: 'static_files'
end
