Rails.application.routes.draw do
  scope '/api' do
    scope 'project' do
      root controller: 'projects', action: :index

      scope ':project_id' do
        root controller: 'projects', action: :show
        root via: [:post], controller: 'projects', action: :edit
        root via: [:delete], controller: 'projects', action: :destroy
        
        get 'preview', controller: 'projects', action: :preview_image
        scope 'query' do
          post 'run', controller: 'project_queries', action: :run_arbitrary
          root via: [:post], controller: 'project_queries', action: :create

          scope ':query_id' do
            root via: [:post], controller: 'project_queries', action: :edit
            root via: [:delete], controller: 'project_queries', action: :destroy
            post 'run', controller: 'project_queries', action: :run_stored
          end
        end

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

    match '*', via: [:get, :post], to: proc { [404, {}, ["Unknown API endpoint"]] }
  end

  get '*path', action: :index, controller: 'static_files'
  root action: :index, controller: 'static_files'
end
