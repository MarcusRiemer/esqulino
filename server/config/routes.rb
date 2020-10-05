Rails.application.routes.draw do
  if Rails.env.development?
    mount GraphiQL::Rails::Engine, at: "/graphiql", graphql_path: "/api/graphql"
  end
  # Second stop: The API for the editor
  scope '/api' do
    post "graphql", to: "graphql#execute"

    scope 'identities' do
      get '/', controller: 'identities', action: :show
      get 'list', controller: 'identities', action: :list
      get 'confirmation/:verify_token', controller: 'identities', action: :email_confirmation
      post 'reset_password_mail', controller: 'identities', action: :reset_password_mail
      post 'send_verify_email', controller: 'identities', action: :send_verify_email
      patch 'reset_password', controller: 'identities', action: :reset_password
      patch 'change_password', controller: 'identities', action: :change_password
      delete 'delete_identity', controller: 'identities', action: :destroy
    end

    scope 'user' do
      get '/', controller: 'user', action: :index
      get 'change_primary_email/:token', controller: 'user', action: :change_primary_email
      post 'send_change_email', controller: 'user', action: :send_change_email
      post 'may_perform', controller: 'user', action: :may_perform
      post 'change_roles', controller: 'user', action: :change_roles
      patch 'change_username', controller: 'user', action: :change_username
    end

    scope 'auth' do
      delete 'sign_out', controller: 'auth', action: :destroy
      match ":provider/callback", to: "auth#callback", via: [:get, :post]
      match 'failure', :to => 'auth#failure', via: [:get, :post]
      match 'failure_msg', :to => 'auth#failure_msg', via: [:get, :post]
    end

    # Everything in the context of projects
    scope 'project' do
      # Everything that does something in the context of a specific project
      scope ':project_id' do
        get 'preview', controller: 'projects', action: :preview_image

        resources :code_resources, only: [:create, :update, :destroy], param: "code_resource_id"
        post 'code_resources/:code_resource_id/clone', controller: 'code_resources', action: 'clone'

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
          get '/', controller: 'project_images', action: :list_show
          post '/', controller: 'project_images', action: :create

          scope ':image_id' do
            get '/', controller: 'project_images', action: :file_show
            post '/', controller: 'project_images', action: :file_update
            delete '/', controller: 'project_images', action: :file_delete

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

    resources :block_languages, only: [:show]

    resources :grammars, only: [:show]
    get 'grammars/:id/code_resources_gallery', controller: 'grammars', action: :code_resources_gallery
    get 'code_resources/by_programming_language/:programming_language_id',
        controller: 'code_resources', action: :index_by_programming_language

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
