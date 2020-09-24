require 'rails_helper'

RSpec.describe GrammarsController, type: :request do
  json_headers = { "CONTENT_TYPE" => "application/json" }
  before(:each) { create(:user, :guest) }

  describe 'GraphQL AdminListGrammars' do
    let(:user) { create(:user, :admin) }
    before(:each) { set_access_token(user) }

    it 'lists nothing if nothing is there' do
      send_query(query_name: "AdminListGrammars")

      expect(response).to have_http_status(200)
      expect(JSON.parse(response.body)['data']['grammars']['nodes'].length).to eq 0
    end

    it 'lists a grammar' do
      FactoryBot.create(:grammar)
      send_query(query_name:"AdminListGrammars")

      expect(response).to have_http_status(200)
      grammars_data = JSON.parse(response.body)['data']['grammars']['nodes']

      expect(grammars_data.length).to eq 1
    end

    it 'limit' do
      FactoryBot.create(:grammar)
      FactoryBot.create(:grammar)
      FactoryBot.create(:grammar)
      send_query(query_name:"AdminListGrammars",variables:{first:1})
      expect(JSON.parse(response.body)['data']['grammars']['nodes'].length).to eq 1

      send_query(query_name:"AdminListGrammars",variables:{first:2})
      expect(JSON.parse(response.body)['data']['grammars']['nodes'].length).to eq 2

      send_query(query_name:"AdminListGrammars",variables:{first:3})
      expect(JSON.parse(response.body)['data']['grammars']['nodes'].length).to eq 3

      send_query(query_name:"AdminListGrammars",variables:{first:4})
      expect(JSON.parse(response.body)['data']['grammars']['nodes'].length).to eq 3
    end

    describe 'order by' do
      before do
        FactoryBot.create(:grammar, name: 'cccc', slug: 'cccc')
        FactoryBot.create(:grammar, name: 'aaaa', slug: 'aaaa')
        FactoryBot.create(:grammar, name: 'bbbb', slug: 'bbbb')
      end

      it 'nonexistant column' do
        send_query(query_name:"AdminListGrammars",variables:{input: {order: {orderField: "test"}}})

        expect(response.status).to eq 200
        #top level error
        expect(JSON.parse(response.body)['errors'].length).not_to eq []
      end

      it 'slug' do
        send_query(query_name:"AdminListGrammars",variables:{input: {order: {orderField: "slug"}}})

        grammars_data = JSON.parse(response.body)['data']['grammars']['nodes']

        expect(grammars_data.map { |p| p['slug'] }).to eq ['aaaa', 'bbbb', 'cccc']
      end

      it 'slug invalid direction' do
        send_query(query_name:"AdminListGrammars",variables:{input: {order: {orderField: "slug", orderDirection: "north"}}})

        expect(response.status).to eq 200
        #top level error
        expect(JSON.parse(response.body)['errors'].length).not_to eq []
      end

      it 'slug desc' do
        send_query(query_name:"AdminListGrammars",variables:{input: {order: {orderField: "slug", orderDirection: "desc"}}})

        grammars_data = JSON.parse(response.body)['data']['grammars']['nodes']

        expect(grammars_data.map { |p| p['slug'] }).to eq ['cccc', 'bbbb', 'aaaa']
      end

      it 'slug asc' do
        send_query(query_name:"AdminListGrammars",variables:{input: {order: {orderField: "slug", orderDirection: "asc"}}})

        grammars_data = JSON.parse(response.body)['data']['grammars']['nodes']

        expect(grammars_data.map { |p| p['slug'] }).to eq ['aaaa', 'bbbb', 'cccc']
      end

      it 'name desc' do
        send_query(query_name:"AdminListGrammars",variables:{input: {order: {orderField: "name", orderDirection: "desc"}}})
        grammars_data = JSON.parse(response.body)['data']['grammars']['nodes']

        expect(grammars_data.map { |p| p['name'] }).to eq ['cccc', 'bbbb', 'aaaa']
      end

      it 'name asc' do
        send_query(query_name:"AdminListGrammars",variables:{input: {order: {orderField: "name", orderDirection: "asc"}}})
        grammars_data = JSON.parse(response.body)['data']['grammars']['nodes']

        expect(grammars_data.map { |p| p['name'] }).to eq ['aaaa', 'bbbb', 'cccc']
      end
    end
  end

  describe 'GraphQL AdminSingleGrammar' do
    let(:user) { create(:user, :admin) }
    before(:each) { set_access_token(user) }

    it 'finds a single grammar by ID' do
      g = FactoryBot.create(:grammar)
      send_query(query_name:"AdminSingleGrammar",variables:{id: g.id})

      expect(response).to have_http_status(200)
      response_data = JSON.parse(response.body)['data']['singleGrammar']

      expect(response_data["id"]).to eq g.id
    end

    it 'finds a single grammar by slug' do
      g = FactoryBot.create(:grammar)
      send_query(query_name:"AdminSingleGrammar",variables:{id: g.slug})

      expect(response).to have_http_status(200)

      expect(JSON.parse(response.body).fetch('errors',[])).to eq []
      grammar_data = JSON.parse(response.body)['data']['singleGrammar']
      # root can't be null in GrammarDocument, but in database
      expect(grammar_data["slug"]).to eq g.slug
    end

    it 'responds with 200 but not empty errors for non existing grammars' do
      send_query(query_name:"AdminSingleGrammar",variables:{id: "0"})

      expect(response).to have_http_status(200)
      expect(JSON.parse(response.body)['errors']).not_to eq []
    end

    it 'includes the CodeResource a grammar is based on' do
      meta_code_resource = FactoryBot.create(:code_resource, :grammar_single_type)
      original = FactoryBot.create(:grammar, generated_from: meta_code_resource)
      send_query(query_name:"AdminSingleGrammar",variables:{id: original.id})

      expect(response).to have_http_status(200)
      grammar_data = JSON.parse(response.body)["data"]["singleGrammar"]
      expect(grammar_data["id"]).to eq original.id
      expect(grammar_data["generatedFromId"]).to eq meta_code_resource.id
    end
  end

  describe 'POST /api/grammars' do
    it 'Creates a new, empty grammar' do
      prog_lang = FactoryBot.create(:programming_language)
      params = {
             "slug" => "spec",
             "name" => "Spec Grammar",
             "programmingLanguageId" => prog_lang.id,
             "types" => {
                 "spec" => {
                     "root" => {
                         "type" => "concrete",
                         "attributes" => []
                     }
                 }
             },
             "root" => {
                 "languageName" => "spec",
                 "typeName" => "root"
             }
         }
      send_query(query_name:"CreateGrammar",variables:params)

      expect(response.media_type).to eq "application/json"

      json_data = JSON.parse(response.body)["data"]["createGrammar"]
      expect(json_data.fetch('errors', [])).to eq []


      g = Grammar.find(json_data["grammar"]['id'])
      expect(g.name).to eq "Spec Grammar"
      expect(g.slug).to eq "spec"
      expect(g.root).to eq({ "languageName" => "spec", "typeName" => "root"})
      expect(g.types["spec"]["root"]).to eq({ "type" => "concrete", "attributes" => [] })

      expect(response.status).to eq(200)
    end

    it 'Attempts to creates a new, invalid grammar (programming_language missing)' do
      prog_lang = FactoryBot.create(:programming_language)
      send_query(query_name:"CreateGrammar",variables:{"slug" => "spec", "name" => "Spec Grammar"})

      expect(response.media_type).to eq "application/json"
      expect(response.status).to eq(200)

      json_data = JSON.parse(response.body)
      expect(json_data['errors']).not_to eq []
    end
  end

  describe 'GraphQL UpdateGrammar' do
    it 'Updating basic properties' do
      orig_grammar = FactoryBot.create(:grammar)
      upda_grammar = {
          "id" => orig_grammar.id,
          "name" => "Upda",
          "types" => {},
          "root" => {
            "languageName" => "spec",
            "typeName" => "root"
          }
      }

      send_query(query_name:"UpdateGrammar",variables:upda_grammar)


      if (not response.body.blank?) then
        json_data = JSON.parse(response.body)["data"]
        expect(json_data.fetch('errors', [])).to eq []
      end

      orig_grammar.reload
      expect(orig_grammar.name).to eq upda_grammar['name']
      expect(orig_grammar.types).to eq Hash.new
      expect(orig_grammar.root).to eq ({ "languageName" => "spec", "typeName" => "root" })
    end

    it 'Update with empty root node' do
      original = FactoryBot.create(:grammar, :model_single_type)
      params_update = { "id" => original.id, "root" => nil }

      send_query(query_name:"UpdateGrammar",variables:params_update)

      unless response.body.blank?
        json_data = JSON.parse(response.body)["data"]
        expect(json_data.fetch('errors', [])).to eq []
      end

      refreshed = Grammar.find(original.id)
      expect(original.root).not_to eq refreshed.root
    end

    it 'Update with invalid root type' do
      original = FactoryBot.create(:grammar, :model_single_type)
      params_update = FactoryBot
                        .attributes_for(:grammar,
                                        name: "Updated empty",
                                        root: { "foo" => "bar" })
                        .transform_keys { |k| k.to_s.camelize(:lower) }
      params_update["id"] = original.id
      send_query(query_name:"UpdateGrammar",variables:params_update)

      expect(response.status).to eq(200)
      expect(JSON.parse(response.body).fetch('errors', [])).not_to eq []
      refreshed = Grammar.find(original.id)
      expect(original.name).to eq refreshed.name
      expect(original.root).to eq refreshed.root
    end

    it 'Set the a CodeResouce that a grammar is generated from' do
      original = FactoryBot.create(:grammar)
      meta_code_resource = FactoryBot.create(:code_resource, :grammar_single_type)
      send_query(query_name:"UpdateGrammar",variables:{"id"=>original.id, "generatedFromId" => meta_code_resource.id })


      original.reload
      expect(original.generated_from).to eq meta_code_resource
    end

    it 'Attempt to set a non-existant CodeResouce that a grammar is generated from' do
      original = FactoryBot.create(:grammar)
      ref_id = SecureRandom.uuid
      send_query(query_name:"UpdateGrammar",variables:{"id"=>original.id, "generatedFromId" => ref_id })

      expect(response.status).to eq(200)

      original.reload
      expect(original.generated_from).to eq nil
    end

    it 'Unset the CodeResouce that a grammar is generated from' do
      meta_code_resource = FactoryBot.create(:code_resource, :grammar_single_type)
      original = FactoryBot.create(:grammar, generated_from: meta_code_resource)

      send_query(query_name:"UpdateGrammar",variables:{"id"=>original.id, "generatedFromId" => nil })

      expect(response.status).to eq(200)

      original.reload

      expect(original.generated_from).to be nil
    end
  end

  describe 'GraphQL DestroyGrammar' do
    let(:user) { create(:user, :admin) }
    before(:each) { set_access_token(user) }

    it 'removes unreferenced grammar' do
      g = FactoryBot.create(:grammar)
      send_query(query_name:"DestroyGrammar",variables:{"id"=>g.id})
      expect(response.status).to eq(200)

      send_query(query_name:"AdminSingleGrammar",variables:{"id"=>g.id})
      expect(response.status).to eq(200)
      expect(JSON.parse(response.body)['errors']).not_to eq []
    end

    it 'keeps referenced grammars' do
      b = FactoryBot.create(:block_language)
      send_query(query_name:"DestroyGrammar",variables:{"id"=>b.grammar_id})
      expect(response.status).to eq(200)

      json_data = JSON.parse(response.body)["data"]["destroyGrammar"]
      expect(json_data.fetch('errors', []).length).to eq 1
      expect(json_data['errors'][0]).to eq "EXISTING_REFERENCES"

      send_query(query_name:"AdminSingleGrammar",variables:{"id"=>b.grammar_id})

      expect(response.status).to eq(200)
      expect(JSON.parse(response.body)['errors']).not_to eq []
    end
  end

  describe 'GET /api/grammars/:grammarId/related_block_languages' do
    it 'Admin: No resources exist' do
      admin = create(:user, :admin)
      set_access_token(admin)

      grammar = FactoryBot.create(:grammar)

      get "/api/grammars/#{grammar.id}/code_resources_gallery",
          :headers => json_headers

      expect(response.status).to eq(200)

      json_data = JSON.parse(response.body)
      expect(json_data).to eq []
    end

    it 'Admin: Single resource exists and is referenced' do
      admin = create(:user, :admin)
      set_access_token(admin)

      block_language = FactoryBot.create(:block_language)
      grammar = block_language.grammar

      res_1 = FactoryBot.create(:code_resource, block_language: block_language)

      get "/api/grammars/#{grammar.id}/code_resources_gallery",
          :headers => json_headers

      expect(response.status).to eq(200)

      json_data = JSON.parse(response.body)
      json_ids = Set.new(json_data.map {|c| c["id"] })
      expect(json_ids).to eq Set.new([res_1.id])
    end

    it 'Admin: Single resource exists and is not referenced' do
      admin = create(:user, :admin)
      set_access_token(admin)

      block_language = FactoryBot.create(:block_language)
      grammar = block_language.grammar

      res_1 = FactoryBot.create(:code_resource)

      get "/api/grammars/#{grammar.id}/code_resources_gallery",
          :headers => json_headers

      expect(response.status).to eq(200)

      json_data = JSON.parse(response.body)
      expect(json_data).to eq []
    end
  end

  describe 'GraphQL AdminSingleGrammar -> Access related blocklanguages' do
    before(:each) {
      admin = create(:user, :admin)
      set_access_token(admin)
    }
    it 'Finds nothing for an unused grammar' do
      original = FactoryBot.create(:grammar)
      send_query(query_name:"AdminSingleGrammar",variables:{"id"=>original.id})

      expect(response.status).to eq(200)
      related = JSON.parse(response.body)["data"]["singleGrammar"]["blockLanguages"]["nodes"]
      expect(related.length).to eq 0
    end

    it 'Finds the single related block language' do
      original = FactoryBot.create(:grammar)
      related = FactoryBot.create(:block_language, grammar: original)

      send_query(query_name:"AdminSingleGrammar",variables:{"id"=>original.id})

      expect(response.status).to eq(200)

      json_data = JSON.parse(response.body)["data"]["singleGrammar"]["blockLanguages"]["nodes"]

      expect(json_data.length).to eq 1
      # validate_against "BlockLanguageListDescription" does not work because of __typename fields
      expect(json_data[0]['name']).to eq related.name
    end

    it 'Ignores unrelated block languages' do
      original = FactoryBot.create(:grammar)
      related = FactoryBot.create(:block_language, grammar: original)
      unrelated = FactoryBot.create(:block_language)

      send_query(query_name:"AdminSingleGrammar",variables:{"id"=>original.id})

      expect(response.status).to eq(200)

      json_data = JSON.parse(response.body)["data"]["singleGrammar"]["blockLanguages"]["nodes"]

      expect(json_data.length).to eq 1
      # validate_against "BlockLanguageListDescription" does not work because of __typename fields
      expect(json_data[0]['name']).to eq related.name
    end
  end
end
