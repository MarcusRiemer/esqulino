Rails.application.routes.draw do

  # Second stop: The API for the editor
  scope '/api' do

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
      get '/', controller: 'projects', action: :index
      get '/list_admin', controller: 'projects', action: :index_admin
      post '/', controller: 'projects', action: :create
      delete '/', controller: 'projects', action: :destroy

      # Everything that does something in the context of a specific project
      scope ':project_id' do
        get '/', controller: 'projects', action: :show
        put '/', controller: 'projects', action: :update
        delete '/', controller: 'projects', action: :destroy

        get 'preview', controller: 'projects', action: :preview_image

        resources :code_resources, only: [:create, :update, :destroy], param: "code_resource_id"
        post 'code_resources/:code_resource_id/clone', controller:  'code_resources', action: 'clone'

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

    # Getting the News as JSON
    scope 'news' do
      scope 'admin' do
        get '/', controller: 'news', action: :index_admin
        get ':id', controller: 'news', action: :show_admin
      end

      get '/', controller: 'news', action: :index
      post '/', controller: 'news', action: :create
      get ':id', controller: 'news', action: :show
      put ':id', controller: 'news', action: :update
      delete ':id', controller: 'news', action: :destroy
    end

    resources :block_languages, only: [:create, :index, :show, :update, :destroy]

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
