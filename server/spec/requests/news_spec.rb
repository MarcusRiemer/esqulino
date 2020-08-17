require 'rails_helper'
include GraphqlQueryHelper

RSpec.describe NewsController, type: :request do
  json_headers = { "CONTENT_TYPE" => "application/json" }
  before(:each) { create(:user, :guest) }

  describe 'GET /api/news' do
    let(:user) { create(:user) }

    it 'Frontpage: retrieving news without anything published' do
      create(:news, published_from: Date.new(2999, 1, 1) )
      post "/api/graphql",
           headers: json_headers,
           params: {
               query: GraphqlQueryHelper.get_query("FrontpageListNews")
           }.to_json

      json_data = JSON.parse(response.body)["data"]["frontpageListNews"]["nodes"]
      expect(response).to have_http_status(200)
      expect(json_data.length).to eq(0)
    end
    it 'Frontpage: retrieving the only existing news (default language)' do
      create(:news)
      post "/api/graphql",
           headers: json_headers,
           params: {
               query: GraphqlQueryHelper.get_query("FrontpageListNews")
           }.to_json
      json_data = JSON.parse(response.body)["data"]["frontpageListNews"]["nodes"]
      expect(json_data.length).to eq(1)
      expect(json_data[0]).to validate_against "NewsFrontpageDescription"
      expect(response).to have_http_status(200)
    end

    it 'Frontpage: retrieving only published news, skipping unpublished ones' do
      create(:news, published_from: nil)

      post "/api/graphql",
           headers: json_headers,
           params: {
               query: GraphqlQueryHelper.get_query("FrontpageListNews")
           }.to_json

      json_data = JSON.parse(response.body)["data"]["frontpageListNews"]["nodes"]
      expect(json_data.length).to eq(0)
      expect(response).to have_http_status(200)
    end

    it 'Frontpage: retrieving only published news, skipping future ones' do
      create(:news, published_from: Date.new(9999, 1, 1))

      post "/api/graphql",
           headers: json_headers,
           params: {
               query: GraphqlQueryHelper.get_query("FrontpageListNews")
           }.to_json

      json_data = JSON.parse(response.body)["data"]["frontpageListNews"]["nodes"]

      expect(json_data.length).to eq(0)
      expect(response).to have_http_status(200)
    end

    it 'Frontpage: Three news exist, only one is eligible' do
      create(:news, published_from: Date.new(9999, 1, 1)) # Future
      create(:news, published_from: nil) # Unpublished
      create(:news) # Published
      post "/api/graphql",
           headers: json_headers,
           params: {
               query: GraphqlQueryHelper.get_query("FrontpageListNews")
           }.to_json

      json_data = JSON.parse(response.body)["data"]["frontpageListNews"]["nodes"]

      expect(json_data.length).to eq(1)
      expect(json_data[0]).to validate_against "NewsFrontpageDescription"
      expect(response).to have_http_status(200)
    end

    it 'Frontpage: retrieving the only existing news (english)' do
      host! 'en.example.com'

      news = create(:news, published_from: Date.new(2019, 1, 1))

      post "/api/graphql",
           headers: json_headers,
           params: {
               query: GraphqlQueryHelper.get_query("FrontpageListNews"),
               variables: {
                   languages: ["en"]
               }
           }.to_json

      json_data = JSON.parse(response.body)["data"]["frontpageListNews"]["nodes"]
      expect(json_data.length).to eq(1)
      expect(json_data[0]['title']).to eq({ "en" =>  news.title['en'] })
      expect(json_data[0]['text']).to eq({ "en" =>  news.rendered_text()['en'] })

      expect(json_data[0]).to validate_against "NewsFrontpageDescription"
    end

    it 'Frontpage: retrieving the only existing news (german)' do
      host! 'de.example.com'

      news = create(:news, published_from: Date.new(2019, 1, 1) )
      post "/api/graphql",
           headers: json_headers,
           params: {
               query: GraphqlQueryHelper.get_query("FrontpageListNews"),
               variables: {
                   languages: ["de"]
               }
           }.to_json

      json_data = JSON.parse(response.body)["data"]["frontpageListNews"]["nodes"]
      expect(json_data.length).to eq(1)
      expect(json_data[0]['title']).to eq({ "de" =>  news.title['de'] })
      expect(json_data[0]['text']).to eq({ "de" =>  news.rendered_text()['de'] })

      expect(json_data[0]).to validate_against "NewsFrontpageDescription"
    end

    it 'Frontpage: News are shortened' do
      news = create(:news, "text" => { "de": "1 <!-- SNIP --> 2" })

      post "/api/graphql",
           headers: json_headers,
           params: {
               query: GraphqlQueryHelper.get_query("FrontpageListNews")
           }.to_json

      json_data = JSON.parse(response.body)["data"]["frontpageListNews"]["nodes"]

      aggregate_failures "frontpage response" do
        expect(json_data.length).to eq(1)
        expect(json_data[0]['text']['de']).to include("1")
        expect(json_data[0]['text']['de']).not_to include("2")
        expect(json_data[0]['text']['de']).not_to eq(news.text['de'])
      end
    end
  end

  describe 'GET /api/news/:id' do
    it 'Frontpage: Existing news' do
      n = create(:news, "text" => { "de": "1 <!-- SNIP --> 2" })

      #TODO: Authentication
      #set_access_token(n.user)
      #
      post "/api/graphql",
           headers: json_headers,
           params: {
               query: GraphqlQueryHelper.get_query("FrontpageSingleNews"),
               variables: {id: n.id}
           }.to_json

      json_data = JSON.parse(response.body)["data"]["frontpageSingleNews"]

      aggregate_failures "frontpage detail response" do
        expect(json_data['text']['de']).to include("1")
        expect(json_data['text']['de']).to include("2")
        expect(json_data['text']['de']).not_to eq(n.text['de'])
      end
    end

    it 'Frontpage: non existant news' do
      post "/api/graphql",
           headers: json_headers,
           params: {
               query: GraphqlQueryHelper.get_query("FrontpageSingleNews"),
               variables: {id: "63ed0067-7bef-4a54-bac7-06831c0fccbd"}
           }.to_json

      expect(response).to have_http_status(200)
      expect(JSON.parse(response.body)["errors"]).not_to eq []
    end
  end

  describe 'GET /api/news/admin' do
    it 'Admin: getting all news in multiple languages, even if unpublished' do
      admin = create(:user, :admin)
      create(:news, published_from: nil )
      create(:news, title: { 'de': "Schlagzeile 1", 'en': "Headline 1"}, published_from: Date.new(2019, 1, 1) )
      create(:news, published_from: Date.new(9999, 12, 1) )

      #set_access_token(admin)

      post "/api/graphql",
           headers: json_headers,
           params: {
               query: GraphqlQueryHelper.get_query("AdminListNews")
           }.to_json
      json_data = JSON.parse(response.body)["data"]["news"]["nodes"]

      expect(json_data[2]['title']['de']).to eq("Schlagzeile 1")
      expect(json_data[2]['title']['en']).to eq("Headline 1")
      expect(json_data[0]['title']['de']).to eq("Schlagzeile")
      expect(json_data[0]['title']['en']).to eq("Headline")
      expect(json_data[1]['title']['de']).to eq("Schlagzeile")
      expect(json_data[1]['title']['en']).to eq("Headline")
      expect(json_data[2]).to validate_against "NewsDescription"
      expect(json_data[1]).to validate_against "NewsDescription"
    end
  end

  describe 'GET /api/news/admin/:id' do
    it 'Admin: Existing news' do
      n = create(:news, "text" => { "de": "1 <!-- SNIP --> 2" })
      #set_access_token(n.user)
      post "/api/graphql",
           headers: json_headers,
           params: {
               query: GraphqlQueryHelper.get_query("AdminSingleNews"),
               variables: {id: n.id}
           }.to_json
      json_data = JSON.parse(response.body)["data"]["adminSingleNews"]

      aggregate_failures "frontpage detail response" do
        expect(json_data['text']['de']).to include("1")
        expect(json_data['text']['de']).to include("2")
        expect(json_data['text']).to eq(n.text)
      end
    end

    it 'Admin: non existant news' do
      post "/api/graphql",
           headers: json_headers,
           params: {
               query: GraphqlQueryHelper.get_query("AdminSingleNews"),
               variables: {id: "63ed0067-7bef-4a54-bac7-06831c0fccbd"}
           }.to_json
      expect(response).to have_http_status(200)
      expect(JSON.parse(response.body)["errors"]).not_to eq []
    end
  end

  describe 'PUT /api/news/:id' do
    it 'updating the title of a news (removing a language)' do
      news = create(:news, published_from: Date.new(2019, 1, 1) )
      #set_access_token(news.user)
      news_params = news.api_attributes.merge({ "title" => { "de" => "Test" }, "id" => news.id })

      post "/api/graphql",
           headers: json_headers,
           params: {
               query: GraphqlQueryHelper.get_query("UpdateNews"),
               variables: news_params
           }.to_json

      # Ensure that no error was reported
      json_data = JSON.parse(response.body)["data"]

      expect(json_data.fetch('errors', [])).to eq []
      expect(response).to have_http_status(200)
      # Ensure the response is well formed
      expect(json_data["updateNews"]["news"]).to validate_against "NewsDescription"

      # Ensure the news has changed
      news.reload
      expect(news.title).to eq news_params["title"]
    end

    it 'updating a news without a valid language' do
      news = create(:news, published_from: Date.new(2019, 1, 1) )
      #set_access_token(news.user)
      news_params = news.api_attributes.merge({ "title" => { "nope" => "no" }, "id" => news.id })

      post "/api/graphql",
           headers: json_headers,
           params: {
               query: GraphqlQueryHelper.get_query("UpdateNews"),
               variables: news_params
           }.to_json

      aggregate_failures "update response" do
        # Graphql always returns with status: 200
        # https://medium.com/@takewakamma/graphql-error-handling-with-graphql-ruby-653aa2a129f6
        # https://www.graph.cool/docs/faq/api-eep0ugh1wa/#how-does-error-handling-work-with-graphcool
        expect(response).to have_http_status(200)

        json_data = JSON.parse(response.body)
        expect(json_data.fetch('errors', [])).not_to eq []
      end

      # Ensure the news has not changed
      curr_news = News.find(news.id)
      expect(curr_news.title).to eq news.title
    end

    xit 'updating a news to remove a previously set publishing date' do
      news = create(:news, published_from: Date.new(2019, 1, 1) )
      news_params = news.api_attributes.merge({ "publishedFrom" => nil, "id" => news.id })

      #set_access_token(news.user)

      post "/api/graphql",
           headers: json_headers,
           params: {
               query: GraphqlQueryHelper.get_query("UpdateNews"),
               variables: news_params
           }.to_json

      aggregate_failures "update response" do
        expect(response).to have_http_status(200)

        json_data = JSON.parse(response.body)["data"]["updateNews"]
        expect(json_data.fetch('errors', [])).to eq []

        expect(json_data["news"]).to validate_against "NewsDescription"
      end

      news.reload
      expect(news.published_from).to be nil
    end

    it 'updating a news with a valid language and an invalid language' do
      news = create(:news, published_from: Date.new(2019, 1, 1) )
      news_params = news.api_attributes.merge({ "title" => { "nope" => "no", "de" => "changed" }, "id" => news.id })

      #set_access_token(news.user)

      post "/api/graphql",
           headers: json_headers,
           params: {
               query: GraphqlQueryHelper.get_query("UpdateNews"),
               variables: news_params
           }.to_json

      # Ensure some kind of error was reported
      json_data = JSON.parse(response.body)["data"]["updateNews"]
      expect(json_data.fetch('errors', [])).not_to eq []

      # Ensure the news has not changed
      curr_news = News.find(news.id)
      expect(curr_news.title).to eq news.title
    end

    it 'updating a news with an invalid date' do
      news = create(:news, title: { 'de': "Schlagzeile 1", 'en': "Headline 1"}, published_from: Date.new(2019, 1, 1) )
      news_params = news.api_attributes.merge({ "publishedFrom" => "test", "id" => news.id })

      #set_access_token(news.user)

      post "/api/graphql",
           headers: json_headers,
           params: {
               query: GraphqlQueryHelper.get_query("UpdateNews"),
               variables: news_params
           }.to_json

      # Ensure some kind of error was reported
      json_data = JSON.parse(response.body)
      expect(response).to have_http_status(200)
      expect(json_data.fetch('errors', [])).not_to eq []

      # Ensure the news has not changed
      curr_news = News.find(news.id)
      expect(curr_news.title).to eq news.title
    end

    it 'updating a news without a date' do
      news = create(:news)
      news_params = news.slice(:id,:title,:text)
      #set_access_token(news.user)
      post "/api/graphql",
           headers: json_headers,
           params: {
               query: GraphqlQueryHelper.get_query("UpdateNews"),
               variables: news_params
           }.to_json

      # Ensure some kind of error was reported
      json_data = JSON.parse(response.body)

      expect(response).to have_http_status(200)
      expect(json_data.fetch('errors', [])).not_to eq []

      # Ensure the news has not changed
      curr_news = News.find(news.id)
      expect(curr_news.title).to eq news.title
    end

  end


  describe 'DELETE /api/news/:id' do
    it 'deleting a news' do
      news = create(:news, title: { 'de': "Schlagzeile 1", 'en': "Headline 1"}, published_from: Date.new(2019, 1, 1), user: create(:user, :admin) )
      # set_access_token(news.user)
      post "/api/graphql",
           headers: json_headers,
           params: {
               query: GraphqlQueryHelper.get_query("DestroyNews"),
               variables: news.slice(:id)
           }.to_json

      expect(response).to have_http_status(200)
      expect(News.find_by(id: news.id)).to be_nil

    end

    it 'deleting a news with an invalid id' do
      news = create(:news)
      count_news = News.all.count

      post "/api/graphql",
           headers: json_headers,
           params: {
               query: GraphqlQueryHelper.get_query("DestroyNews"),
               variables: {id: "63ed0067-7bef-4a54-bac7-06831c0fccbd"}
           }.to_json

      expect(response).to have_http_status(200)
      expect(JSON.parse(response.body)["data"]["destroyNews"]["errors"]).not_to eq []
      expect(count_news).to eq(News.all.count)
    end
  end

  describe "POST /api/news" do
    let(:user) { create(:user, :admin) }

    it 'creating a news' do
      #set_access_token(user)
      count_news = News.all.count
      post "/api/graphql",
           headers: json_headers,
           params: {
               query: GraphqlQueryHelper.get_query("CreateNews"),
               variables: {
                   title: { 'de': 'Test' },
                   text: { 'de': 'Test2' },
                   publishedFrom: Date.new(2019, 1, 1)
               }
           }.to_json

      json_data = JSON.parse(response.body)["data"]["createNews"]
      expect(json_data.fetch('errors', [])).to eq []
      news_data = json_data["news"]

      expect(news_data['id']).to_not be_nil
      expect(news_data['text']).to_not be_nil
      expect(news_data['title']).to_not be_nil
      expect(news_data['publishedFrom']).to_not be_nil
      expect(count_news).to_not eq(News.all.count)
    end

    xit 'creating a news with an empty publishing date' do
      #set_access_token(user)
      count_news = News.all.count

      post "/api/graphql",
           headers: json_headers,
           params: {
               query: GraphqlQueryHelper.get_query("CreateNews"),
               variables: {
                   title: { 'de': 'Test' },
                   text: { 'de': 'Test2' },
                   publishedFrom: nil
               }
           }.to_json

      json_data = JSON.parse(response.body)["data"]["createNews"]

      expect(json_data.fetch('errors', [])).to eq []
      news_data = json_data["news"]

      expect(news_data['id']).to_not be_nil
      expect(news_data['text']).to_not be_nil
      expect(news_data['title']).to_not be_nil
      expect(news_data['publishedFrom']).to be_nil
      expect(count_news).to_not eq(News.all.count)
    end

    it 'creating a news with an invalid date' do
      #set_access_token(user)
      post "/api/graphql",
           headers: json_headers,
           params: {
               query: GraphqlQueryHelper.get_query("CreateNews"),
               variables: {
                   title: { 'de': 'Test' },
                   text: { 'de': 'Test2' },
                   publishedFrom: "tom"
               }
           }.to_json

      json_data = JSON.parse(response.body)
      expect(json_data.fetch('errors', [])).not_to eq []
      expect(response).to have_http_status(200)
    end

    it 'creating a news without a date' do
      news = build(:news)
      news_params = news.api_attributes.except("publishedFrom")
      #set_access_token(user)

      post "/api/graphql",
           headers: json_headers,
           params: {
               query: GraphqlQueryHelper.get_query("CreateNews"),
               variables: news_params
           }.to_json
      json_data = JSON.parse(response.body)

      expect(json_data.fetch('errors', [])).not_to eq []
      expect(response).to have_http_status(200)

      # Ensure the news has not changed
      expect(News.count).to eq 0
    end
  end
end