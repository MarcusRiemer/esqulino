Rails.application.routes.draw do
  scope '/api' do
    get 'project', controller: 'projects', action: :index
    get 'project/:project_id', controller: 'projects', action: :show
    get 'project/:project_id/preview', controller: 'projects', action: :preview_image
  end

  get '*path', action: :index, controller: 'static_files'
  root action: :index, controller: 'static_files'
end
