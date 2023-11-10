require 'rails_helper'

RSpec.describe ProjectDatabasesController, type: :request do
  before(:each) { create(:user, :guest) }

  # A database with a single table
  def database_description_key_value
    [
      {
        'name' => 'key_value',
        'columns' => [
          {
            'name' => 'key',
            'type' => 'INTEGER',
            'index' => 0,
            'primary' => true,
            'notNull' => true
          },
          {
            'name' => 'value',
            'type' => 'TEXT',
            'index' => 1,
            'primary' => false,
            'notNull' => false,
            'dfltValue' => 'value'
          }
        ],
        'foreignKeys' => [],
        'systemTable' => false
      }
    ]
  end

  def json_headers
    {
      'CONTENT_TYPE' => 'application/json',
      'Authorization' => "Basic #{Base64.encode64('user:user')}"
    }
  end

  describe 'GET /api/project/:project_id/db/:database_id/visual_schema' do
    it 'works for empty databases' do
      project = FactoryBot.create(:project_with_default_database)

      get "#{default_db_api_url project}/visual_schema?format=graphviz"
      expect(response.status).to eq 200
      expect(response.body).to include('digraph')

      get "#{default_db_api_url project}/visual_schema?format=svg"
      expect(response.status).to eq 200
      expect(response.body).to include('DOCTYPE svg')

      get "#{default_db_api_url project}/visual_schema?format=png"
      expect(response.status).to eq 200

      # Downloading the image
      get "#{default_db_api_url project}/visual_schema?format=png&download"
      expect(response.status).to eq 200
    end

    it 'works for databases with a single table' do
      project = FactoryBot.create(:project_with_default_database)
      project.default_database.table_create(database_description_key_value[0])

      get "#{default_db_api_url project}/visual_schema?format=graphviz"
      expect(response.status).to eq 200
      expect(response.body).to include('key_value')

      get "#{default_db_api_url project}/visual_schema?format=svg"
      expect(response.status).to eq 200
      expect(response.body).to include('key_value')
      expect(response.body).to include('/vendor/icons/key.png')
      expect(response.body).to include('DOCTYPE svg')

      get "#{default_db_api_url project}/visual_schema?format=png"
      expect(response.status).to eq 200
    end
  end

  describe 'POST /api/project/:project_id/db/:database_id/create' do
    it 'creating a single table in an empty database' do
      project = FactoryBot.create(:project_with_default_database)

      set_access_token(project.user)
      post "#{default_db_api_url project}/create",
           headers: json_headers,
           params: database_description_key_value[0].to_json

      expect(response.status).to eq 204
    end

    it 'creating a single table twice' do
      project = FactoryBot.create(:project_with_default_database)

      set_access_token(project.user)
      post "#{default_db_api_url project}/create",
           headers: json_headers,
           params: database_description_key_value[0].to_json
      expect(response.status).to eq 204

      post "#{default_db_api_url project}/create",
           headers: json_headers,
           params: database_description_key_value[0].to_json
      expect(response.status).to eq 400
    end
  end

  describe 'POST /api/project/:project_id/db/:database_id/alter' do
    it 'renaming an existing table' do
      project = FactoryBot.create(:project_with_default_database)
      project.default_database.table_create(database_description_key_value[0])
      project.default_database.save

      set_access_token(project.user)
      post "#{default_db_api_url project}/alter/key_value",
           headers: json_headers,
           params: {
             'commands' => [
               {
                 'index' => 0,
                 'type' => 'renameTable',
                 'oldName' => 'key_value',
                 'newName' => 'value_key'
               }
             ]
           }.to_json

      expect(response.status).to eq 200
    end

    it 'renaming a not existing table' do
      project = FactoryBot.create(:project_with_default_database)
      project.default_database.table_create(database_description_key_value[0])
      project.default_database.save

      set_access_token(project.user)
      post "#{default_db_api_url project}/alter/doesntexist",
           headers: json_headers,
           params: {
             'commands' => [
               {
                 'index' => 0,
                 'type' => 'renameTable',
                 'oldName' => 'doesntexist',
                 'newName' => 'value_key'
               }
             ]
           }.to_json

      expect(response.status).to eq 404
    end
  end

  describe 'DELETE /api/project/:project_id/db/:database_id/drop/:tablename' do
    it 'Unpermitted: Deleting an existing table' do
      project = FactoryBot.create(:project_with_default_database)
      project.default_database.table_create(database_description_key_value[0])
      project.default_database.save

      delete "#{default_db_api_url project}/drop/key_value",
             headers: json_headers

      expect(response.status).to eq 403

      project.default_database.reload
      expect(project.default_database.table_exists?('key_value')).to eq true
    end

    it 'deleting an existing table' do
      project = FactoryBot.create(:project_with_default_database)
      project.default_database.table_create(database_description_key_value[0])
      project.default_database.save

      set_access_token(project.user)
      delete "#{default_db_api_url project}/drop/key_value",
             headers: json_headers

      expect(response.status).to eq 204

      project.default_database.reload
      expect(project.default_database.table_exists?('key_value')).to eq false
    end

    it 'deleting a not existing table' do
      project = FactoryBot.create(:project_with_default_database)
      project.default_database.table_create(database_description_key_value[0])
      project.default_database.save

      set_access_token(project.user)
      delete "#{default_db_api_url project}/drop/doesntexist",
             headers: json_headers

      expect(response.status).to eq 404
    end
  end

  describe 'GET /api/project/:project_id/db/:database_id/count/:tablename' do
    it 'getting rowcount of an empty table' do
      project = FactoryBot.create(:project_with_default_database)
      project.default_database.table_create(database_description_key_value[0])
      project.default_database.save

      get "#{default_db_api_url project}/count/key_value"
      expect(response.status).to eq 200
      expect(response.body.to_i).to eq 0
    end

    it 'getting rowcount of a table with 100 entries' do
      db = FactoryBot.create(:project_database, :table_numbers, row_count: 100)

      get "#{default_db_api_url db.project}/count/numbers"
      expect(response.status).to eq 200
      expect(response.body.to_i).to eq 100
    end
  end

  describe 'GET /api/project/:project_id/db/:database_id/rows/:tablename/:from/:amount' do
    it 'getting data of an empty table' do
      project = FactoryBot.create(:project_with_default_database)
      project.default_database.table_create(database_description_key_value[0])
      project.default_database.save

      get "#{default_db_api_url project}/rows/key_value/0/10"
      expect(response.status).to eq 200
      expect(JSON.parse(response.body)).to eq []
    end
  end

  describe 'POST /api/project/:project_id/db/:database_id/data/:tablename/bulk-insert' do
    it 'Inserting a single row' do
      project = FactoryBot.create(:project_with_default_database)
      project.default_database.table_create(database_description_key_value[0])
      project.default_database.save

      set_access_token(project.user)
      post "#{default_db_api_url project}/data/key_value/bulk-insert",
           headers: json_headers,
           params: {
             'columnNames' => %w[key value],
             'data' => [
               %w[1 eins]
             ]
           }.to_json

      # Ensure the response is well formed
      expect(response).to have_http_status(200)
      json_data = JSON.parse(response.body)
      expect(json_data).to validate_against 'ResponseTabularInsertDescription'
      expect(json_data).to eq({
                                'numInsertedRows' => 1,
                                'numTotalRows' => 1
                              })

      # Ensure that the data has actually changed
      expect(project.default_database.table_row_count('key_value')).to eq 1
    end

    it 'Inserting multiple rows' do
      project = FactoryBot.create(:project_with_default_database)
      project.default_database.table_create(database_description_key_value[0])
      project.default_database.save

      set_access_token(project.user)
      post "#{default_db_api_url project}/data/key_value/bulk-insert",
           headers: json_headers,
           params: {
             'columnNames' => %w[key value],
             'data' => [
               %w[1 eins],
               %w[2 eins],
               %w[3 eins]
             ]
           }.to_json

      # Ensure the response is well formed
      expect(response).to have_http_status(200)
      json_data = JSON.parse(response.body)
      expect(json_data).to validate_against 'ResponseTabularInsertDescription'
      expect(json_data).to eq({
                                'numInsertedRows' => 3,
                                'numTotalRows' => 3
                              })

      # Ensure that the data has actually changed
      expect(project.default_database.table_row_count('key_value')).to eq 3
    end

    it 'Malformed: No column names' do
      project = FactoryBot.create(:project_with_default_database)
      project.default_database.table_create(database_description_key_value[0])
      project.default_database.save

      set_access_token(project.user)
      post "#{default_db_api_url project}/data/key_value/bulk-insert",
           headers: json_headers,
           params: {
             'data' => [
               %w[1 eins]
             ]
           }.to_json

      expect(response.status).to eq 400
    end

    it 'Malformed: Empty column names' do
      project = FactoryBot.create(:project_with_default_database)
      project.default_database.table_create(database_description_key_value[0])
      project.default_database.save

      set_access_token(project.user)
      post "#{default_db_api_url project}/data/key_value/bulk-insert",
           headers: json_headers,
           params: {
             'columnNames' => [],
             'data' => [
               %w[1 eins]
             ]
           }.to_json

      expect(response.status).to eq 400
    end
  end

  describe '/api/project/:projectId/db/:dbId/{upload,download}' do
    it 'Rejects missing files' do
      project = FactoryBot.create(:project_with_default_database)
      db = project.default_database

      set_access_token(project.user)
      post "#{default_db_api_url project}/upload",
           headers: json_headers,
           params: {}.to_json

      expect(response.status).to eq 400

      json_data = JSON.parse(response.body)
      expect(json_data['errors'].length).to eq 1
    end

    it 'Rejects empty files' do
      project = FactoryBot.create(:project_with_default_database)
      db = project.default_database

      emptyFile = Tempfile.new('empty.sqlite')

      set_access_token(project.user)
      post "#{default_db_api_url project}/upload",
           headers: json_headers,
           params: {
             'database' => Rack::Test::UploadedFile.new(emptyFile.path)
           }

      expect(response.status).to eq 400

      json_data = JSON.parse(response.body)
      expect(json_data['errors'].length).to eq 1
    end

    it 'Uploads if there wasn\'t a database previously' do
      project = FactoryBot.create(:project)

      dbFile = Tempfile.new('db.sqlite')
      db = SQLite3::Database.new dbFile.path

      db.execute 'create table numbers (name varchar(30),val int);'

      set_access_token(project.user)
      # Upload the file
      post "/api/project/#{project.slug}/db/default/upload",
           headers: json_headers,
           params: {
             'database' => Rack::Test::UploadedFile.new(dbFile.path)
           }

      expect(response.status).to eq 200
      json_data = JSON.parse(response.body)

      # And retrieve it again
      project.reload

      expect(project.default_database).not_to be nil

      get "#{default_db_api_url project}/download"
      expect(response.status).to eq 200
      expect(response.body).to eq File.binread(dbFile)
    end

    it 'Accepts valid databases' do
      project = FactoryBot.create(:project_with_default_database)

      dbFile = Tempfile.new('db.sqlite')
      db = SQLite3::Database.new dbFile.path

      db.execute 'create table numbers (name varchar(30),val int);'

      set_access_token(project.user)
      # Upload the file
      post "#{default_db_api_url project}/upload",
           headers: json_headers,
           params: {
             'database' => Rack::Test::UploadedFile.new(dbFile.path)
           }

      expect(response.status).to eq 200
      json_data = JSON.parse(response.body)

      # And retrieve it again
      get "#{default_db_api_url project}/download"
      expect(response.status).to eq 200
      expect(response.body).to eq File.binread(dbFile)
    end
  end

  private

  def default_db_api_url(project)
    "/api/project/#{project.slug}/db/#{project.default_database.id}"
  end
end
