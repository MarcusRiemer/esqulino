Rails.application.routes.draw do
  scope '/api' do
    scope 'project' do
      root controller: 'projects', action: :index

      scope ':project_id' do
        root controller: 'projects', action: :show
        get 'preview', controller: 'projects', action: :preview_image

        scope 'db/:database_id' do
          get 'visual_schema', controller: 'project_databases', action: :visual_schema
          get 'count', controller: 'project_databases', action: :table_row_count
          get 'count/:tablename', controller: 'project_databases', action: :table_row_count
          get 'rows/:tablename/:from/:amount', controller: 'project_databases', action: :table_row_data
          post 'alter/:tablename', controller: 'project_databases', action: :table_alter
        end
      end
    end

    match '*', via: [:get, :post], to: proc { [404, {}, ["Unknown API endpoint"]] }
  end

  get '*path', action: :index, controller: 'static_files'
  root action: :index, controller: 'static_files'
end
