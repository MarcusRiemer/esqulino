require 'rails_helper'

RSpec.describe ProjectQueriesController, type: :request do
  let(:default_headers) {
    {
      "Authorization" => "Basic #{Base64.encode64('user:user')}",
      "CONTENT_TYPE" => "application/json"
    }
  }

  describe '/api/project/:project_id/query/run' do
    after(:each) do
      if @db.project && @db.project.default_database_id == @db.id then
        @db.project.update!(default_database: nil)
      end
      @db.destroy!
      @db.project.destroy! if @db.project
    end

    it 'Arbitrary query with 7 rows' do
      @db = FactoryBot.create(:project_database, :table_key_value)
      query = FactoryBot.build(:code_resource, :sql_key_value_select_double)

      post "/api/project/#{@db.project.slug}/query/run",
           :headers => default_headers,
           params: {
             "ast" => query.ast,
             "params" => {}
           }.to_json
      expect(response.status).to eq 200

      json_data = JSON.parse(response.body)
      expect(json_data.fetch('errors', [])).to eq []
      expect(json_data["columns"]).to eq(["key", "value", "key", "value"].map {|c| "key_value." + c })
      expect(json_data["rows"][0]).to eq [3, "drei", 3, "drei"]
      expect(json_data["totalCount"]).to eq 7
    end
  end

  describe '/api/project/:project_id/query/simulate/insert' do
  end

  describe '/api/project/:project_id/query/simulate/delete' do
  end
end
