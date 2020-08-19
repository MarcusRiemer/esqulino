require 'rails_helper'

RSpec.describe BlockLanguagesController, type: :request do
  before(:each) { create(:user, :guest) }

  describe 'GET /api/block_languages' do
    it 'lists nothing if nothing is there' do
      get "/api/block_languages"
      send_query(query_name: "AdminListBlockLanguages")
      byebug

      expect(response).to have_http_status(200)
      expect(JSON.parse(response.body)['data'].length).to eq 0
    end

    it 'lists a single block language' do
      FactoryBot.create(:block_language)
      get "/api/block_languages"
      send_query(query_name: "AdminListBlockLanguages")
      expect(response).to have_http_status(200)

      json_data = JSON.parse(response.body)['data']['blockLanguages']
    
      expect(json_data['nodes'].length).to eq 1
      expect(json_data['totalCount']).to eq 1
        # Description file can't be used, because graphql query solved the overfetching problem. Only the fields are requested which are used.
        # expect(json_data['data']['nodes']).to validate_against "BlockLanguageListResponseDescription"
    end

    it 'limit' do
      FactoryBot.create(:block_language)
      FactoryBot.create(:block_language)
      FactoryBot.create(:block_language)
      send_query(query_name: "AdminListBlockLanguages",variables:{first:1})

      expect(JSON.parse(response.body)['data']['blockLanguages']['nodes'].length).to eq 1
      expect(JSON.parse(response.body)['data']['blockLanguages']['totalCount']).to eq 3

      send_query(query_name: "AdminListBlockLanguages",variables:{first:2})
      expect(JSON.parse(response.body)['data']['blockLanguages']['nodes'].length).to eq 2

      send_query(query_name: "AdminListBlockLanguages",variables:{first:3})
      expect(JSON.parse(response.body)['data']['blockLanguages']['nodes'].length).to eq 3

      send_query(query_name: "AdminListBlockLanguages",variables:{first:4})
      expect(JSON.parse(response.body)['data']['blockLanguages']['nodes'].length).to eq 3
    end

    describe 'order by' do
      before do
        FactoryBot.create(:block_language, name: 'cccc', slug: 'cccc')
        FactoryBot.create(:block_language, name: 'aaaa', slug: 'aaaa')
        FactoryBot.create(:block_language, name: 'bbbb', slug: 'bbbb')
      end

      it 'nonexistant column' do
        send_query(query_name: "AdminListBlockLanguages",variables:{input: {order: {orderField:"nonexistant"}}})

        expect(JSON.parse(response.body)['errors'].length).not_to eq []
        expect(response.status).to eq 200
      end

      it 'slug' do
        send_query(query_name: "AdminListBlockLanguages",variables:{input: {order: {orderField:"slug"}}})
        json_data = JSON.parse(response.body)['data']['blockLanguages']['nodes']

        expect(json_data.map { |p| p['slug'] }).to eq ['aaaa', 'bbbb', 'cccc']
      end

      it 'slug invalid direction' do
        send_query(query_name: "AdminListBlockLanguages",variables:{input: {order: {orderDirection:"north"}}})

        expect(JSON.parse(response.body)['errors'].length).not_to eq []
        expect(response.status).to eq 200
      end

      it 'slug desc' do
        send_query(query_name: "AdminListBlockLanguages",variables:{input: {order: {orderField:"slug",orderDirection:"desc"}}})
        json_data = JSON.parse(response.body)['data']['blockLanguages']['nodes']

        expect(json_data.map { |p| p['slug'] }).to eq ['cccc', 'bbbb', 'aaaa']
      end

      it 'slug asc' do
        send_query(query_name: "AdminListBlockLanguages",variables:{input: {order: {orderField:"slug",orderDirection:"asc"}}})
        json_data = JSON.parse(response.body)['data']['blockLanguages']['nodes']

        expect(json_data.map { |p| p['slug'] }).to eq ['aaaa', 'bbbb', 'cccc']
      end

      it 'name desc' do
        send_query(query_name: "AdminListBlockLanguages",variables:{input: {order: {orderField:"name",orderDirection:"desc"}}})
        json_data = JSON.parse(response.body)['data']['blockLanguages']['nodes']

        expect(json_data.map { |p| p['name'] }).to eq ['cccc', 'bbbb', 'aaaa']
      end

      it 'name asc' do
        send_query(query_name: "AdminListBlockLanguages",variables:{input: {order: {orderField:"name",orderDirection:"asc"}}})
        json_data = JSON.parse(response.body)['data']['blockLanguages']['nodes']

        expect(json_data.map { |p| p['name'] }).to eq ['aaaa', 'bbbb', 'cccc']
      end
    end
  end

  describe 'GET /api/block_language/:blockLanguageId' do
    it 'finds a single block language by ID' do
      b = FactoryBot.create(:block_language)
      send_query(query_name: "AdminEditBlockLanguage",variables:{id: b.id})

      expect(response).to have_http_status(200)

      json_data = JSON.parse(response.body)['data']['singleBlockLanguage']

      expect(json_data).to validate_against "BlockLanguageDescription"
    end

    it 'finds a single block language by slug' do
      b = FactoryBot.create(:block_language)
      send_query(query_name: "AdminEditBlockLanguage",variables:{id: b.slug})

      expect(response).to have_http_status(200)

      json_data = JSON.parse(response.body)['data']['singleBlockLanguage']

      expect(json_data).to validate_against "BlockLanguageListItemDescription"
    end

    it 'responds with 404 for non existing languages' do
      send_query(query_name: "AdminEditBlockLanguage",variables:{id: "0"})

      expect(response).to have_http_status(200)
      json_data = JSON.parse(response.body)
      expect(json_data["errors"]).not_to eq []
    end
  end

  describe 'POST /api/block_languages' do
    it 'Creates a new, empty block language' do
      g = FactoryBot.create(:grammar)
      params = {
          "name" => "Spec Lang",
          "sidebars" => [],
          "editorComponents" => [],
          "editorBlocks" => [],
          "grammarId" => g.id,
          "defaultProgrammingLanguageId" => g.programming_language_id
      }
      send_query(query_name: "CreateBlockLanguage",variables:params)

      expect(response.media_type).to eq "application/json"

      json_data = JSON.parse(response.body)["data"]["createBlockLanguage"]
      expect(json_data.fetch('errors', [])).to eq []
      expect(json_data["id"]).not_to eq nil
      # can not be validated against BlockLanguageDescription, because graphql mutation fixed the overfetching problem.
      # The client only needs the id and errors as return
      #expect(json_data).to validate_against "BlockLanguageDescription"

      expect(response.status).to eq(200)
    end

    it 'Creates a new block language with model properties' do
      g = FactoryBot.create(:grammar)
      block_lang_model = {
             "name" => "Spec Lang",
             "sidebars" => [
               {
                 "type" => "fixedBlocks",
                 "caption" => "Spec Blocks",
                 "categories" => [
                   {
                     "categoryCaption" => "first",
                     "blocks" => [
                       {
                         "defaultNode" => {
                           "language" => "spec",
                           "name" => "block"
                         },
                         "displayName" => "Block #1",
                       }
                     ]
                   }
                 ]
               }
             ],
             "editorComponents" => [],
             "editorBlocks" => [
               {
                 "describedType" => {
                   "languageName" => "spec",
                   "typeName" => "block"
                 },
                 "visual" => []
               }
             ],
             "rootCssClasses" => ["a", "b"],
             "grammarId" => g.id,
             "defaultProgrammingLanguageId" => g.programming_language_id
           }

      send_query(query_name: "CreateBlockLanguage",variables:block_lang_model)

      expect(response.media_type).to eq "application/json"

      json_data = JSON.parse(response.body)["data"]["createBlockLanguage"]
      expect(json_data.fetch('errors', [])).to eq []
      expect(response.status).to eq(200)

      # can not be validated against BlockLanguageDescription, because graphql mutation fixed the overfetching problem.
      # The client only needs the id and errors as return
      #expect(json_data).to validate_against "BlockLanguageDescription"

      send_query(query_name: "AdminListBlockLanguages")
      id = JSON.parse(response.body)['data']['blockLanguages']["nodes"][0]["id"]

      send_query(query_name: "AdminEditBlockLanguage",variables:{id: id})
      json_data = JSON.parse(response.body)['data']['singleBlockLanguage']

      expect(json_data.except("id", "createdAt", "updatedAt","generated","localGeneratorInstructions","slug")).to eq block_lang_model
    end

    fdescribe 'PUT /api/block_languages/:id' do
      it 'Updating basic properties' do
        orig_block_lang = FactoryBot.create(:block_language)
        upda_block_lang = {
          "id" => orig_block_lang.id,
          "name" => "Upda",
          "sidebars" => [
            {
              "type" => "fixedBlocks",
              "caption" => "Spec Blocks",
              "categories" => [
                {
                  "categoryCaption" => "first",
                  "blocks" => [
                    {
                      "defaultNode" => {
                        "language" => "spec",
                        "name" => "block"
                      },
                      displayName: "Block #1",
                    }
                  ]
                }
              ]
            }
          ],
          "editorComponents" => [],
          "editorBlocks" => [
            {
              "describedType" => {
                "languageName" => "spec",
                "typeName" => "block"
              },
              "visual" => []
            }
          ]
        }
        send_query(query_name: "UpdateBlockLanguage",variables:upda_block_lang)


        if (not response.body.blank?) then
          json_data = JSON.parse(response.body)
          expect(json_data.fetch('errors', [])).to eq []
        end

        expect(response.status).to eq(200)
        byebug
        orig_block_lang.reload
        expect(orig_block_lang.name).to eq upda_block_lang['name']

        # For whatever reason the order of things changes somewhere and RSpec
        # freaks out because the order of things in a hash changes. We do some very
        # basic poking to mitigate this ...
        expect(orig_block_lang.model["sidebars"][0]["blocks"]).to eq upda_block_lang["sidebars"][0]["blocks"]
        expect(orig_block_lang.model["editorBlocks"][0]).to eq upda_block_lang["editorBlocks"][0]
      end

      it 'Update with invalid empty model' do
        original = FactoryBot.create(:block_language)

        # Create params to change name and model
        params_update = FactoryBot
                          .attributes_for(:block_language,
                                          name: "Updated empty",
                                          model: Hash.new)
                          .transform_keys { |k| k.to_s.camelize(:lower) }

        # Merge the model parameters into the actual update and remove it
        # afterwards. This results in a theoretically valid request
        params_update_req = params_update.merge(params_update["model"])
        params_update_req.delete("model")

        put "/api/block_languages/#{original.id}",
            :headers => json_headers,
            :params => params_update_req.to_json

        expect(response.status).to eq(400)

        # Ensure that nothing has changed
        refreshed = BlockLanguage.find(original.id)
        expect(original.name).to eq refreshed.name
        expect(refreshed.model).to_not be nil
      end

      it 'Update without localGeneratorInstructions' do
        original = FactoryBot.create(:block_language, :auto_generated_blocks)
        expect(original.model["localGeneratorInstructions"]).to_not be nil

        # Parameters without localGeneratorInstructions
        params_update = original.api_attributes
        params_update_req = params_update.merge(params_update["model"])
        params_update_req.delete("localGeneratorInstructions")

        put "/api/block_languages/#{original.id}",
            :headers => json_headers,
            :params => params_update_req.to_json

        expect(response.status).to eq(204)

        # Ensure that nothing has changed
        refreshed = BlockLanguage.find(original.id)
        expect(original.name).to eq refreshed.name
        expect(refreshed.model).to_not be nil
        expect(refreshed.model["localGeneratorInstructions"]).to be nil
      end
    end
  end

  describe 'DELETE /api/block_language/:blockLanguageId' do
    it 'removes unreferenced language' do
      b = FactoryBot.create(:block_language)

      delete "/api/block_languages/#{b.id}",
             :headers => json_headers

      expect(response.status).to eq(204)
    end

    it 'keeps referenced language' do
      b = FactoryBot.create(:block_language)
      FactoryBot.build(:code_resource, block_language: b)

      delete "/api/block_languages/#{b.id}",
             :headers => json_headers

      expect(response.status).to eq(400)
      json_data = JSON.parse(response.body)
      expect(json_data.fetch('errors', []).length).to eq 1
      expect(json_data['errors'][0]).to eq "EXISTING_REFERENCES"

      get "/api/block_languages/#{b.id}",
          :headers => json_headers

      expect(response.status).to eq(200)
    end
  end

end
