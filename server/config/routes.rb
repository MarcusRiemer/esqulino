Rails.application.routes.draw do
  scope '/api' do
    scope 'project' do
      root controller: 'projects', action: :index

      scope ':project_id' do
        root controller: 'projects', action: :show
        get 'preview', controller: 'projects', action: :preview_image
        get 'db/:database_id/visual_schema', controller: 'project_databases', action: :visual_schema
      end
    end
  end

  get '*path', action: :index, controller: 'static_files'
  root action: :index, controller: 'static_files'
end
