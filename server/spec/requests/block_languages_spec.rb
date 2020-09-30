require 'rails_helper'

RSpec.describe BlockLanguagesController, type: :request do
  before(:each) { create(:user, :guest) }

  describe 'GraphQL AdminListBlockLanguages' do
    let(:user) { create(:user, :admin) }
    before(:each) { set_access_token(user) }

    it 'lists nothing if nothing is there' do
      send_query(query_name: "AdminListBlockLanguages")

      expect(response).to have_http_status(200)
      expect(JSON.parse(response.body)['data']['blockLanguages']['nodes'].length).to eq 0
      expect(JSON.parse(response.body)['data']['blockLanguages']['totalCount']).to eq 0
    end

    it 'lists a single block language' do
      FactoryBot.create(:block_language)
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

  describe 'GraphQL FullBlockLanguage' do
    let(:user) { create(:user, :admin) }
    before(:each) { set_access_token(user) }


    it 'finds a single block language by ID' do
      b = FactoryBot.create(:block_language)
      send_query(query_name: "FullBlockLanguage",variables:{id: b.id})

      expect(response).to have_http_status(200)

      json_data = JSON.parse(response.body)
      block_lang_node = json_data['data']['blockLanguages']['nodes'][0]

      expect(block_lang_node["id"]).to eq b.id
    end

    it 'non existing languages' do
      send_query(query_name: "FullBlockLanguage",variables:{id: "0"})

      expect(response).to have_http_status(200)
      json_data = JSON.parse(response.body)
      expect(json_data["errors"]).not_to eq []
    end
 end

  describe 'GraphQL CreateBlockLanguage' do
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

      expect(BlockLanguage.count).to eq 1

      b = BlockLanguage.first
      block_lang_model.each do |key,value|
        key = key.underscore
        expect(b[key]).to eq(value), "Attribute '#{key}' didn't match"
      end
    end
  end

  describe 'GraphQL UpdateBlockLanguage' do
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
        ]
      }
      send_query(query_name: "UpdateBlockLanguage",variables:upda_block_lang)


      if (not response.body.blank?) then
        json_data = JSON.parse(response.body)
        expect(json_data.fetch('errors', [])).to eq []
      end

      expect(response.status).to eq(200)

      orig_block_lang.reload
      upda_block_lang.each do |key,value|
        key = key.underscore
        expect(orig_block_lang[key]).to eq(value), "Attribute '#{key}' didn't match"
      end
    end
  end


  describe 'GraphQL DestroyBlockLanguage' do
    let(:user) { create(:user, :admin) }
    before(:each) { set_access_token(user) }

    it 'removes unreferenced language' do
      b = FactoryBot.create(:block_language)

      send_query(query_name: "DestroyBlockLanguage",variables:{id:b.id})

      expect(response.status).to eq(200)

      expect(BlockLanguage.count).to eq 0
    end

    it 'keeps referenced language' do
      b = FactoryBot.create(:block_language)
      FactoryBot.build(:code_resource, block_language: b)

      send_query(query_name: "DestroyBlockLanguage",variables:{id:b.id})

      expect(response.status).to eq(200)
      json_data = JSON.parse(response.body)["data"]["destroyBlockLanguage"]

      expect(json_data.fetch('errors', []).length).to eq 1
      expect(json_data['errors'][0]).to eq "EXISTING_REFERENCES"

      send_query(query_name: "AdminListBlockLanguages")

      expect(response).to have_http_status(200)
      expect(JSON.parse(response.body)['data']['blockLanguages']['nodes'].length).to eq 1
      expect(JSON.parse(response.body)['data']['blockLanguages']['totalCount']).to eq 1
    end
  end

end
