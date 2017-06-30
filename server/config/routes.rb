Rails.application.routes.draw do
  scope '/api' do
    scope 'project' do
      root controller: 'projects', action: :index

      scope ':project_id' do
        root controller: 'projects', action: :show
        root controller: 'projects', action: :update, via: [:post]
        
        get 'preview', controller: 'projects', action: :preview_image

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
