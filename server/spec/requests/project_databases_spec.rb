require 'rails_helper'

RSpec.describe ProjectDatabasesController, type: :request do

  # A database with a single table
  def database_description_key_value
    [
      {
        "name" => "key_value",
        "columns" => [
          {
            "name" => "key",
            "type" => "INTEGER",
            "index" => 0,
            "primary" => true,
            "not_null" => true,
          },
          {
            "name" => "value",
            "type" => "TEXT",
            "index" => 1,
            "primary" => false,
            "not_null" => false,
            "dflt_value" => "value"
          }
        ],
        "foreign_keys" => []
      }
    ]
  end

  def json_headers
    { "CONTENT_TYPE" => "application/json" }
  end

  let(:auth_headers) { {"Authorization" => "Basic #{Base64.encode64('user:user')}"} }

  describe 'GET /api/project/:project_id/db/:database_id/visual_schema' do
    it 'works for empty databases' do
      project = FactoryBot.create(:project_with_default_database)
      
      get "#{default_db_api_url project}/visual_schema?format=graphviz"
      expect(response.status).to eq 200
      expect(response.body).to include("digraph")

      get "#{default_db_api_url project}/visual_schema?format=svg"
      expect(response.status).to eq 200
      expect(response.body).to include("DOCTYPE svg")

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
      expect(response.body).to include("key_value")

      get "#{default_db_api_url project}/visual_schema?format=svg"
      expect(response.status).to eq 200
      expect(response.body).to include("key_value")
      expect(response.body).to include("/vendor/icons/key.png")
      expect(response.body).to include("DOCTYPE svg")

      get "#{default_db_api_url project}/visual_schema?format=png"
      expect(response.status).to eq 200
    end
  end

  describe 'POST /api/project/:project_id/db/:database_id/create' do
    it 'creating a single table in an empty database' do
      project = FactoryBot.create(:project_with_default_database)

      post "#{default_db_api_url project}/create",
           :headers => json_headers,
           :params => database_description_key_value[0].to_json

      expect(response.status).to eq 204
    end

    it 'creating a single table twice' do
      project = FactoryBot.create(:project_with_default_database)

      post "#{default_db_api_url project}/create",
           :headers => json_headers,
           :params => database_description_key_value[0].to_json
      expect(response.status).to eq 204

      post "#{default_db_api_url project}/create",
           :headers => json_headers,
           :params => database_description_key_value[0].to_json
      expect(response.status).to eq 400
    end
  end

  describe 'POST /api/project/:project_id/db/:database_id/alter' do
    it 'renaming an existing table' do
      project = FactoryBot.create(:project_with_default_database)
      project.default_database.table_create(database_description_key_value[0])
      project.default_database.save

      post "#{default_db_api_url project}/alter/key_value",
           :headers => json_headers,
           :params => {
             "commands" => [
               {
                 "index" => 0,
                 "type" => "renameTable",
                 "oldName" => "key_value",
                 "newName" => "value_key"
               }
             ]
           }.to_json

      expect(response.status).to eq 200
    end

    it 'renaming a not existing table' do
      project = FactoryBot.create(:project_with_default_database)
      project.default_database.table_create(database_description_key_value[0])
      project.default_database.save

      post "#{default_db_api_url project}/alter/doesntexist",
           :headers => json_headers,
           :params => {
             "commands" => [
               {
                 "index" => 0,
                 "type" => "renameTable",
                 "oldName" => "doesntexist",
                 "newName" => "value_key"
               }
             ]
           }.to_json

      expect(response.status).to eq 404
    end
  end

  describe 'DELETE /api/project/:project_id/db/:database_id/drop/:tablename' do
    it 'deleting an existing table' do
      project = FactoryBot.create(:project_with_default_database)
      project.default_database.table_create(database_description_key_value[0])
      project.default_database.save

      delete "#{default_db_api_url project}/drop/key_value"
      expect(response.status).to eq 204
    end

    it 'deleting a not existing table' do
      project = FactoryBot.create(:project_with_default_database)
      project.default_database.table_create(database_description_key_value[0])
      project.default_database.save

      delete "#{default_db_api_url project}/drop/doesntexist"
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
  end

  describe 'GET /api/project/:project_id/db/:database_id/rows/:tablename/:from/:amount' do
    it 'getting data of an empty table' do
      project = FactoryBot.create(:project_with_default_database)
      project.default_database.table_create(database_description_key_value[0])
      project.default_database.save

      get "#{default_db_api_url project}/rows/key_value/0/10"
      expect(response.status).to eq 200
      expect(JSON.parse response.body).to eq []
    end
  end

  private

  def default_db_api_url(project)
    "/api/project/#{project.slug}/db/#{project.default_database.id}"
  end
end