require 'rails_helper'

RSpec.describe GraphqlController, type: :request do
  json_headers = { "CONTENT_TYPE" => "application/json" }
  before(:each) { create(:user, :guest) }

  describe 'Basic error handling', pending: "Currently no server side query loading" do
    it 'no query, only invalid name' do
      post "/api/graphql",
           :headers => json_headers,
           :params => {
             operationName: "ThisOperationWillNeverExist",
             variables: { }
           }.to_json

      response_json = JSON.parse response.body

      aggregate_failures do
        expect(response.status).to eq 404
        expect(response_json.fetch("errors", [])).not_to eq [{"message" => "No query string was present"}]
      end
    end

    it 'no query, only valid name' do
      post "/api/graphql",
           :headers => json_headers,
           :params => {
             operationName: "RegenerateForeignTypes",
             variables: { }
           }.to_json

      response_json = JSON.parse response.body

      aggregate_failures do
        expect(response.status).to eq 200
        expect(response_json.fetch("errors", [])).not_to eq [{"message" => "No query string was present"}]
      end
    end
  end

  describe 'POST /api/graphql Projects' do
    let(:user) { create(:user) }

    it 'Projects: Requesting name and total count without any input' do
      FactoryBot.create(:project, name: {en: "hello-1",de: "hallo-1"})
      FactoryBot.create(:project, name: {en: "hello-2",de: "hallo-2"})
      FactoryBot.create(:project, name: {en: "hello-3",de: "hallo-3"})
      post "/api/graphql",
           headers: json_headers,
           params: {
               query:"{projects{nodes{name}totalCount}}"
           }.to_json

      response_data =  JSON.parse(response.body)['data']['projects']
      project_names = response_data['nodes'].map {|p| p['name']}

      expect(response).to have_http_status(200)
      expect(response_data['totalCount']).to eq(3)
      expect(project_names).to eq([{"de"=>"hallo-1", "en"=>"hello-1"}, {"de"=>"hallo-2", "en"=>"hello-2"}, {"de"=>"hallo-3", "en"=>"hello-3"}])
    end

    it 'Projects: Added languages as input parameter and expect to return only requested language' do
      FactoryBot.create(:project, name: {en: "hello-1",de: "hallo-1"})
      FactoryBot.create(:project, name: {en: "hello-2",de: "hallo-2"})
      FactoryBot.create(:project, name: {en: "hello-3",de: "hallo-3"})
      post "/api/graphql",
           headers: json_headers,
           params: {
               query:"{projects(input: {languages:[de]}){nodes{name}}}"
           }.to_json

      project_names =  JSON.parse(response.body)['data']['projects']['nodes'].map {|p| p['name']}

      expect(response).to have_http_status(200)
      expect(project_names).to eq([{"de"=>"hallo-1"}, {"de"=>"hallo-2"}, {"de"=>"hallo-3"}])
    end

    it 'Projects: Added not provided language as input parameter and should return error' do
      FactoryBot.create(:project, name: {en: "hello-1",de: "hallo-1"})
      post "/api/graphql",
           headers: json_headers,
           params: {
               query:"{projects(input: {languages:[test]}){nodes{name}}}"
           }.to_json

      response_data =  JSON.parse(response.body)
      expect(response).to have_http_status(200)
      expect(response_data.has_key? "errors").to be true
    end

    it 'Projects: Added filter as input parameter and expect to return only filtered project' do
      FactoryBot.create(:project, name: {en: "hello-1",de: "hallo-1"})
      FactoryBot.create(:project, name: {en: "hello-2",de: "hallo-2"})
      FactoryBot.create(:project, name: {en: "hello-3",de: "hallo-3"})
      post "/api/graphql",
           headers: json_headers,
           params: {
               query:"{projects(input: {filter:{name:\"hello-1\"}}){nodes{name}}}"
           }.to_json
      project_names =  JSON.parse(response.body)['data']['projects']['nodes'].map {|p| p['name']}

      expect(response).to have_http_status(200)
      expect(project_names).to eq([{"de"=>"hallo-1", "en"=>"hello-1"}])
    end

    it 'Projects: Added not provided filter field as input parameter and should return error' do
      FactoryBot.create(:project, name: {en: "hello-1",de: "hallo-1"})
      post "/api/graphql",
           headers: json_headers,
           params: {
               query:"{projects(input: {filter:{test:\"hello-1\"}}){nodes{name}}}"
           }.to_json

      response_data =  JSON.parse(response.body)

      expect(response).to have_http_status(200)
      expect(response_data.has_key? "errors").to be true
    end

    it 'Projects: Added order as input parameter and expect to return ordered names' do
      FactoryBot.create(:project, name: {en: "hello-1",de: "hallo-1"})
      FactoryBot.create(:project, name: {en: "hello-3",de: "hallo-3"})
      FactoryBot.create(:project, name: {en: "hello-2",de: "hallo-2"})
      post "/api/graphql",
           headers: json_headers,
           params: {
               query:"{projects(input: {order:{orderField:name,orderDirection:asc}}){nodes{name}}}"
           }.to_json

      project_names =  JSON.parse(response.body)['data']['projects']['nodes'].map {|p| p['name']}

      expect(response).to have_http_status(200)
      expect(project_names).to eq([{"de"=>"hallo-1", "en"=>"hello-1"}, {"de"=>"hallo-2", "en"=>"hello-2"}, {"de"=>"hallo-3", "en"=>"hello-3"}])
    end

    it 'Projects: Added not provided orderField as input parameter and expect to return error' do
      FactoryBot.create(:project, name: {en: "hello-1",de: "hallo-1"})
      post "/api/graphql",
           headers: json_headers,
           params: {
               query:"{projects(input: {order:{orderField:test,orderDirection:asc}}){nodes{name}}}"
           }.to_json

      response_data =  JSON.parse(response.body)

      expect(response).to have_http_status(200)
      expect(response_data.has_key? "errors").to be true
    end

    it 'Projects: Added not provided orderDirection as input parameter and expect to return error' do
      FactoryBot.create(:project, name: {en: "hello-1",de: "hallo-1"})
      post "/api/graphql",
           headers: json_headers,
           params: {
               query:"{projects(input: {order:{orderField:name,orderDirection:test}}){nodes{name}}}"
           }.to_json

      response_data =  JSON.parse(response.body)

      expect(response).to have_http_status(200)
      expect(response_data.has_key? "errors").to be true
    end

    it 'Projects: Added not provided input parameter and expect to return error' do
      FactoryBot.create(:project, name: {en: "hello-1",de: "hallo-1"})
      post "/api/graphql",
           headers: json_headers,
           params: {
               query:"{projects(input: {test:test}){nodes{name}}}"
           }.to_json

      response_data =  JSON.parse(response.body)

      expect(response).to have_http_status(200)
      expect(response_data.has_key? "errors").to be true
    end

    it 'Projects: Requesting not provided column and expect to return error' do
      FactoryBot.create(:project, name: {en: "hello-1",de: "hallo-1"})
      post "/api/graphql",
           headers: json_headers,
           params: {
               query:"{projects{nodes{test}}}"
           }.to_json

      response_data =  JSON.parse(response.body)

      expect(response).to have_http_status(200)
      expect(response_data.has_key? "errors").to be true
    end

    it 'Projects: Requesting all pagination connection type fields' do
      FactoryBot.create(:project, name: {en: "hello-1",de: "hallo-1"})
      post "/api/graphql",
           headers: json_headers,
           params: {
               query:"{projects{nodes{name}edges{cursor node{name}}pageInfo{endCursor hasNextPage hasPreviousPage startCursor}totalCount}}"
           }.to_json

      response_data =  JSON.parse(response.body)
      projects_data = response_data['data']['projects']

      expect(response).to have_http_status(200)
      expect(response_data.has_key? "errors").to be false
      expect(projects_data.has_key? "nodes").to be true
      expect(projects_data['nodes'][0].has_key? "name").to be true
      expect(projects_data.has_key? "edges").to be true
      expect(projects_data['edges'][0].has_key? "cursor").to be true
      expect(projects_data['edges'][0].has_key? "node").to be true
      expect(projects_data['edges'][0]['node'].has_key? "name").to be true
      expect(projects_data.has_key? "pageInfo").to be true
      expect(projects_data['pageInfo'].has_key? "endCursor").to be true
      expect(projects_data['pageInfo'].has_key? "hasNextPage").to be true
      expect(projects_data['pageInfo'].has_key? "hasPreviousPage").to be true
      expect(projects_data['pageInfo'].has_key? "startCursor").to be true
      expect(projects_data.has_key? "totalCount").to be true
    end

    it 'Projects: Requesting all columns of projects model and expect not to return error' do
      FactoryBot.create(:project, name: {en: "hello",de: "hallo"})
      post "/api/graphql",
           headers: json_headers,
           params: {
               query:"{projects{nodes{name blockLanguages{id}codeResources{id}createdAt defaultDatabase{id}description grammars{id}id indexPageId name preview projectSources{id}public slug updatedAt user{id}}}}"
           }.to_json
      response_data =  JSON.parse(response.body)['data']['projects']

      expect(response).to have_http_status(200)
      expect(response_data.has_key? "errors").to be false
    end

    it 'Projects: Requesting all multilingual columns and expect to return json with language keys' do
      FactoryBot.create(:project, name: {en: "hello",de: "hallo"},description:{en: "Greeting",de: "Begruessung"})
      post "/api/graphql",
           headers: json_headers,
           params: {
               query:"{projects{nodes {description name}}}"
           }.to_json

      nodes_data =  JSON.parse(response.body)['data']['projects']['nodes'].first

      expect(response).to have_http_status(200)
      expect(nodes_data['name']['en']).to eq("hello")
      expect(nodes_data['name']['de']).to eq("hallo")
      expect(nodes_data['description']['en']).to eq("Greeting")
      expect(nodes_data['description']['de']).to eq("Begruessung")
    end
    it 'Projects: Requesting additional column which doesnt exist in any model and expect to return its value' do
      p = FactoryBot.create(:project, name: {en: "hello",de: "hallo"},description:{en: "Greeting",de: "Begruessung"})
      FactoryBot.create(:code_resource, project_id: p.id)
      FactoryBot.create(:code_resource, project_id: p.id)
      post "/api/graphql",
           headers: json_headers,
           params: {
               query:"{projects{nodes {codeResourceCount}}}"
           }.to_json

      nodes_data =  JSON.parse(response.body)['data']['projects']['nodes'].first
      expect(response).to have_http_status(200)
      expect(nodes_data['codeResourceCount']).to eq(2)
    end

    it 'Projects: Requesting only public projects' do
      FactoryBot.create(:project, name: {en: "hello",de: "hallo"},public:true)
      FactoryBot.create(:project, name: {en: "hello",de: "hallo"},public:false)
      post "/api/graphql",
           headers: json_headers,
           params: {
               query:"{projects(input: {filter: {public: true}}){totalCount}}"
           }.to_json

      total_count =  JSON.parse(response.body)['data']['projects']['totalCount']
      expect(response).to have_http_status(200)
      expect(total_count).to eq(1)
    end

    it 'Projects: Requesting code_resource relation' do
      p = FactoryBot.create(:project, name: {en: "hello",de: "hallo"},description:{en: "Greeting",de: "Begruessung"})
      FactoryBot.create(:code_resource, name: "test1", project_id: p.id)
      FactoryBot.create(:code_resource, name: "test2", project_id: p.id)
      post "/api/graphql",
           headers: json_headers,
           params: {
               query:"{projects {nodes{codeResources{name}codeResourceCount}}}"
           }.to_json
      nodes_data =  JSON.parse(response.body)['data']['projects']['nodes'].first
      code_resource_data = nodes_data['codeResources']
      expect(response).to have_http_status(200)
      expect(nodes_data['codeResourceCount']).to eq(2)
      expect(code_resource_data.map {|c| c['name']}).to eq(["test1","test2"])
    end

    it 'Projects: Requesting code_resource relation without having code_resources' do
      p = FactoryBot.create(:project, name: {en: "hello",de: "hallo"},description:{en: "Greeting",de: "Begruessung"})
      FactoryBot.create(:code_resource, name: "Leer", project_id: p.id)
      post "/api/graphql",
           headers: json_headers,
           params: {
               query:"{projects {nodes{codeResources{name}codeResourceCount}}}"
           }.to_json

      nodes_data =  JSON.parse(response.body)['data']['projects']['nodes'].first
      expect(response).to have_http_status(200)
      expect(nodes_data['codeResourceCount']).to eq(1)
      expect(nodes_data['codeResources'][0]['name']).to eq("Leer")
    end
    it 'Projects: Requesting code_resource_count and projects totalCount, so projects totalCount (in connection) has to deal with AcitveRecord::Relation' do
      p = FactoryBot.create(:project, name: {en: "hello",de: "hallo"},description:{en: "Greeting",de: "Begruessung"})
      FactoryBot.create(:code_resource, name: "test1", project_id: p.id)
      FactoryBot.create(:code_resource, name: "test2", project_id: p.id)
      post "/api/graphql",
           headers: json_headers,
           params: {
               query:"{projects {nodes{codeResourceCount}totalCount}}"
           }.to_json

      projects_data =  JSON.parse(response.body)['data']['projects']
      expect(response).to have_http_status(200)
      expect(projects_data['nodes'][0]['codeResourceCount']).to eq(2)
      expect(projects_data['totalCount']).to eq(1)
    end
  end
end
