require 'rails_helper'

RSpec.describe GraphqlController, type: :request do
  json_headers = { "CONTENT_TYPE" => "application/json" }

  describe 'Basic error handling' do
    it 'no query, only invalid name' do
      response = execute_query(operation_name:"ThisOperationWillNeverExist" )

      aggregate_failures do
        expect(response.fetch("errors", [])).not_to eq [{"message" => "No query string was present"}]
      end
    end

    it 'no query, only valid name' do
      response = execute_query(operation_name:"RegenerateForeignTypes" )

      aggregate_failures do
        expect(response.fetch("errors", [])).not_to eq [{"message" => "No query string was present"}]
      end
    end
  end

  describe 'POST /api/graphql Projects' do
    let(:user) { create(:user) }
    it 'Projects: Reuqesting name and total count without any input besides languages' do
      FactoryBot.create(:project, name: {en: "hello-1",de: "hallo-1"})
      FactoryBot.create(:project, name: {en: "hello-2",de: "hallo-2"})
      FactoryBot.create(:project, name: {en: "hello-3",de: "hallo-3"})

      response_data = execute_query(query:"{projects(input: {languages:[de,en]}){nodes{name}totalCount}}" )['data']['projects']
      project_names = response_data['nodes'].map {|p| p['name']}

      expect(response_data['totalCount']).to eq(3)
      expect(project_names).to eq([{"de"=>"hallo-1", "en"=>"hello-1"}, {"de"=>"hallo-2", "en"=>"hello-2"}, {"de"=>"hallo-3", "en"=>"hello-3"}])
    end

    it 'Projects: Added languages as input parameter and expect to return only requested language' do
      FactoryBot.create(:project, name: {en: "hello-1",de: "hallo-1"})
      FactoryBot.create(:project, name: {en: "hello-2",de: "hallo-2"})
      FactoryBot.create(:project, name: {en: "hello-3",de: "hallo-3"})

      project_names = execute_query(query:"{projects(input: {languages:[de]}){nodes{name}totalCount}}" )['data']['projects']['nodes'].map {|p| p['name']}

      expect(project_names).to eq([{"de"=>"hallo-1"}, {"de"=>"hallo-2"}, {"de"=>"hallo-3"}])
    end

    it 'Projects: Added not provided language as input parameter and should return error' do
      FactoryBot.create(:project, name: {en: "hello-1",de: "hallo-1"})

      response_data = execute_query(query:"{projects(input: {languages:[test]}){nodes{name}}}" )

      expect(response_data.has_key? "errors").to be true
    end

    it 'Projects: Added filter as input parameter and expect to return only filtered project' do
      FactoryBot.create(:project, name: {en: "hello-1",de: "hallo-1"})
      FactoryBot.create(:project, name: {en: "hello-2",de: "hallo-2"})
      FactoryBot.create(:project, name: {en: "hello-3",de: "hallo-3"})

      project_names = execute_query(query:"{projects(input: {filter:{name:\"hallo-1\"}}){nodes{name}}}" )['data']['projects']['nodes'].map {|p| p['name']}

      expect(project_names).to eq([{"en"=>"hello-1","de"=>"hallo-1"}])
    end

    it 'Projects: Added not provided filter field as input parameter and should return error' do
      FactoryBot.create(:project, name: {en: "hello-1",de: "hallo-1"})
      query = "{projects(input: {filter:{test:\"hello-1\"}}){nodes{name}}}"
      response_data = execute_query(query:query)

      expect(response_data.has_key? "errors").to be true
    end

    it 'Projects: Added order as input parameter and expect to return ordered names' do
      FactoryBot.create(:project, name: {en: "hello-1",de: "hallo-1"})
      FactoryBot.create(:project, name: {en: "hello-3",de: "hallo-3"})
      FactoryBot.create(:project, name: {en: "hello-2",de: "hallo-2"})
      query = "{projects(input: {order:{orderField:name,orderDirection:asc}}){nodes{name}}}"

      project_names = execute_query(query:query)['data']['projects']['nodes'].map {|p| p['name']}

      expect(project_names).to eq([{"en"=>"hello-1","de"=>"hallo-1"}, {"en"=>"hello-2","de"=>"hallo-2"}, {"en"=>"hello-3","de"=>"hallo-3"}])
    end

    it 'Projects: Added not provided orderField as input parameter and expect to return error' do
      FactoryBot.create(:project, name: {en: "hello-1",de: "hallo-1"})

      query = "{projects(input: {order:{orderField:test,orderDirection:asc}}){nodes{name}}}"
      response_data = execute_query(query:query)

      expect(response_data.has_key? "errors").to be true
    end

    it 'Projects: Added not provided orderDirection as input parameter and expect to return error' do
      FactoryBot.create(:project, name: {en: "hello-1",de: "hallo-1"})

      query = "{projects(input: {order:{orderField:name,orderDirection:test}}){nodes{name}}}"
      response_data = execute_query(query:query)

      expect(response_data.has_key? "errors").to be true
    end

    it 'Projects: Added not provided input parameter and expect to return error' do
      FactoryBot.create(:project, name: {en: "hello-1",de: "hallo-1"})


      query = "{projects(input: {test:test}){nodes{name}}}"
      response_data = execute_query(query:query)

      expect(response_data.has_key? "errors").to be true
    end

    it 'Projects: Requesting not provided column and expect to return error' do
      FactoryBot.create(:project, name: {en: "hello-1",de: "hallo-1"})

      query = "{projects{nodes{test}}}"
      response_data = execute_query(query:query)

      expect(response_data.has_key? "errors").to be true
    end

    it 'Projects: Requesting all pagination connection type fields' do
      FactoryBot.create(:project, name: {en: "hello-1",de: "hallo-1"})

      query = "{projects{nodes{name}edges{cursor node{name}}pageInfo{endCursor hasNextPage hasPreviousPage startCursor}totalCount}}"
      response_data = execute_query(query:query)
      projects_data = response_data['data']['projects']

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

      query = "{projects{nodes{name blockLanguages{id}codeResources{id}createdAt defaultDatabase{id}description grammars{id}id indexPageId name preview projectSources{id}public slug updatedAt user{id}}}}"
      response_data = execute_query(query:query)['data']['projects']


      expect(response_data.has_key? "errors").to be false
    end

    it 'Projects: Requesting all multilingual columns and expect to return json with language keys' do
      FactoryBot.create(:project, name: {en: "hello",de: "hallo"},description:{en: "Greeting",de: "Begruessung"})

      query = "{projects(input: {languages:[de,en]}){nodes {description name}}}"
      nodes_data = execute_query(query:query)['data']['projects']['nodes'].first

      expect(nodes_data['name']['en']).to eq("hello")
      expect(nodes_data['name']['de']).to eq("hallo")
      expect(nodes_data['description']['en']).to eq("Greeting")
      expect(nodes_data['description']['de']).to eq("Begruessung")
    end
    it 'Projects: Requesting additional column which doesnt exist in any model and expect to return its value' do
      p = FactoryBot.create(:project, name: {en: "hello",de: "hallo"},description:{en: "Greeting",de: "Begruessung"})
      FactoryBot.create(:code_resource, project_id: p.id)
      FactoryBot.create(:code_resource, project_id: p.id)

      query = "{projects{nodes {codeResourceCount}}}"
      nodes_data = execute_query(query:query)['data']['projects']['nodes'].first

      expect(nodes_data['codeResourceCount']).to eq(2)
    end

    it 'Projects: Requesting only public projects' do
      FactoryBot.create(:project, name: {en: "hello",de: "hallo"},public:true)
      FactoryBot.create(:project, name: {en: "hello",de: "hallo"},public:false)

      query = "{projects(input: {filter: {public: true}}){totalCount}}"
      total_count = execute_query(query:query)['data']['projects']['totalCount']

      expect(total_count).to eq(1)
    end

    it 'Projects: Requesting code_resource relation' do
      p = FactoryBot.create(:project, name: {en: "hello",de: "hallo"},description:{en: "Greeting",de: "Begruessung"})
      FactoryBot.create(:code_resource, name: "test1", project_id: p.id)
      FactoryBot.create(:code_resource, name: "test2", project_id: p.id)

      query = "{projects {nodes{codeResources{name}codeResourceCount}}}"
      nodes_data = execute_query(query:query)['data']['projects']['nodes'].first

      code_resource_data = nodes_data['codeResources']
      expect(nodes_data['codeResourceCount']).to eq(2)
      expect(code_resource_data.map {|c| c['name']}).to eq(["test1","test2"])
    end

    it 'Projects: Requesting code_resource relation without having code_resources' do
      p = FactoryBot.create(:project, name: {en: "hello",de: "hallo"},description:{en: "Greeting",de: "Begruessung"})
      FactoryBot.create(:code_resource, name: "Leer", project_id: p.id)

      query = "{projects {nodes{codeResources{name}codeResourceCount}}}"
      nodes_data = execute_query(query:query)['data']['projects']['nodes'].first

      expect(nodes_data['codeResourceCount']).to eq(1)
      expect(nodes_data['codeResources'][0]['name']).to eq("Leer")
    end
    it 'Projects: Requesting code_resource_count and projects totalCount, so projects totalCount (in connection) has to deal with AcitveRecord::Relation' do
      p = FactoryBot.create(:project, name: {en: "hello",de: "hallo"},description:{en: "Greeting",de: "Begruessung"})
      FactoryBot.create(:code_resource, name: "test1", project_id: p.id)
      FactoryBot.create(:code_resource, name: "test2", project_id: p.id)

      query = "{projects {nodes{codeResourceCount}totalCount}}"
      projects_data = execute_query(query:query)['data']['projects']

      expect(projects_data['nodes'][0]['codeResourceCount']).to eq(2)
      expect(projects_data['totalCount']).to eq(1)
    end
  end
end
