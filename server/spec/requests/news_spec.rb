require 'rails_helper'

RSpec.describe NewsController, type: :request do
  json_headers = { "CONTENT_TYPE" => "application/json" }

  it 'User: retrieving news without anything published' do
    news = create(:news, published_from: Date.new(2019, 11, 1) )
    get '/api/news'
    json_data = JSON.parse(response.body)
    expect(json_data.length).to eq(0)
  end

  it 'User: retrieving the only existing news (default language)' do
    news = create(:news, published_from: Date.new(2019, 1, 1) )
    get '/api/news'
    json_data = JSON.parse(response.body)
    expect(json_data.length).to eq(1)
  end

  it 'User: retrieving the only existing news (english)' do
    host! 'en.example.com'

    news = create(:news, published_from: Date.new(2019, 1, 1) )
    get '/api/news'
    json_data = JSON.parse(response.body)
    expect(json_data.length).to eq(1)
    expect(json_data[0]['title']).to eq({ "en" =>  news.title['en'] })
    expect(json_data[0]['text']).to eq({ "en" =>  news.rendered_text()['en'] })
  end

  it 'User: retrieving the only existing news (german)' do
    host! 'de.example.com'

    news = create(:news, published_from: Date.new(2019, 1, 1) )
    get '/api/news'
    json_data = JSON.parse(response.body)
    expect(json_data.length).to eq(1)
    expect(json_data[0]['title']).to eq({ "de" =>  news.title['de'] })
    expect(json_data[0]['text']).to eq({ "de" =>  news.rendered_text()['de'] })
  end

  it 'Admin: getting all news in multiple languages' do
    create(:news, title: { 'de': "Schlagzeile 1", 'en': "Headline 1"}, published_from: Date.new(2019, 1, 1) )
    create(:news, published_from: Date.new(2019, 12, 1) )
    create(:news, published_from: Date.new(2019, 11, 1) )
    get '/api/news/admin'
    json_data = JSON.parse(response.body)
    expect(json_data[0]['title']['de']).to eq("Schlagzeile 1")
    expect(json_data[0]['title']['en']).to eq("Headline 1")
    expect(json_data[1]['title']['de']).to eq("Schlagzeile")
    expect(json_data[1]['title']['en']).to eq("Headline")
    expect(json_data[2]['title']['de']).to eq("Schlagzeile")
    expect(json_data[2]['title']['en']).to eq("Headline")
  end

  it 'updating the title of a news (removing a language)' do
    news = create(:news, published_from: Date.new(2019, 1, 1) )
    news_params = news.api_attributes.merge({ "title" => { "de" => "Test" } })

    put "/api/news/#{news.id}",
        :headers => json_headers,
        :params => news_params.to_json

    # Ensure that no error was reported
    json_data = JSON.parse(response.body)
    expect(json_data.fetch('errors', [])).to eq []
    expect(response).to have_http_status(200)

    # Ensure the news has changed
    curr_news = News.find(news.id)
    expect(curr_news.title).to eq news_params["title"]
  end

  it 'updating a news without a valid language' do
    news = create(:news, published_from: Date.new(2019, 1, 1) )
    news_params = news.api_attributes.merge({ "title" => { "nope" => "no" }})

    put "/api/news/#{news.id}",
        :headers => json_headers,
        :params => news_params.to_json

    # Ensure some kind of error was reported
    expect(response).to have_http_status(400)
    json_data = JSON.parse(response.body)
    expect(json_data.fetch('errors', [])).not_to eq []

    # Ensure the news has not changed
    curr_news = News.find(news.id)
    expect(curr_news.title).to eq news.title
  end

  it 'updating a news to remove a previously set publishing date' do
    news = create(:news, published_from: Date.new(2019, 1, 1) )

    news_params = news.api_attributes.merge({ "publishedFrom" => nil })

    put "/api/news/#{news.id}",
        :headers => json_headers,
        :params => news_params.to_json

    news.reload

    aggregate_failures "update response" do
      expect(response).to have_http_status(200)

      json_data = JSON.parse(response.body)
      expect(json_data.fetch('errors', [])).to eq []

      expect(news.published_from).to be nil
    end
  end

  it 'updating a news with a valid language and an invalid language' do
    news = create(:news, published_from: Date.new(2019, 1, 1) )

    news_params = news.api_attributes.merge({ "title" => { "nope" => "no", "de" => "changed" }})

    put "/api/news/#{news.id}",
        :headers => json_headers,
        :params => news_params.to_json

    # Ensure some kind of error was reported
    expect(response).to have_http_status(400)
    json_data = JSON.parse(response.body)
    expect(json_data.fetch('errors', [])).not_to eq []

    # Ensure the news has not changed
    curr_news = News.find(news.id)
    expect(curr_news.title).to eq news.title
  end

  it 'updating a news with an invalid date' do
    news = create(:news, title: { 'de': "Schlagzeile 1", 'en': "Headline 1"}, published_from: Date.new(2019, 1, 1) )
    news_params = news.api_attributes.merge({ "publishedFrom" => "test" })

    put "/api/news/#{news.id}",
        :headers => json_headers,
        :params => news_params.to_json

    # Ensure some kind of error was reported
    json_data = JSON.parse(response.body)
    expect(response).to have_http_status(400)

    # Ensure the news has not changed
    curr_news = News.find(news.id)
    expect(curr_news.title).to eq news.title
  end

  it 'deleting a news' do
    news = create(:news, title: { 'de': "Schlagzeile 1", 'en': "Headline 1"}, published_from: Date.new(2019, 1, 1) )

    delete "/api/news/#{news.id}"

    expect(response).to have_http_status(204)
    expect(News.find_by(id: news.id)).to be_nil
  end

  it 'deleting a news with an invalid id' do
    news = create(:news)
    count_news = News.all.count

    delete "/api/news/#{SecureRandom.uuid}"

    expect(response).to have_http_status(404)
    expect(count_news).to eq(News.all.count)
  end

  it 'creating a news' do
    count_news = News.all.count
    post "/api/news",
         headers: json_headers,
         params: {
           title: { 'de': 'Test' },
           text: { 'de': 'Test2' },
           publishedFrom: Date.new(2019, 1, 1)
         }.to_json

    json_data = JSON.parse(response.body)
    expect(json_data.fetch('errors', [])).to eq []

    expect(json_data['id']).to_not be_nil
    expect(json_data['text']).to_not be_nil
    expect(json_data['title']).to_not be_nil
    expect(json_data['publishedFrom']).to_not be_nil
    expect(count_news).to_not eq(News.all.count)
  end

  it 'creating a news without a publishing date' do
    count_news = News.all.count
    post "/api/news",
         headers: json_headers,
         params: {
           title: { 'de': 'Test' },
           text: { 'de': 'Test2' },
           publishedFrom: nil
         }.to_json

    json_data = JSON.parse(response.body)
    expect(json_data.fetch('errors', [])).to eq []

    expect(json_data['id']).to_not be_nil
    expect(json_data['text']).to_not be_nil
    expect(json_data['title']).to_not be_nil
    expect(json_data['publishedFrom']).to be_nil
    expect(count_news).to_not eq(News.all.count)
  end

  it 'creating a news with an invalid date' do
    count_news = News.all.count
    post "/api/news",
         headers: json_headers,
         params: {
           title: { 'de': 'Test' },
           text: { 'de': 'Test2' },
           publishedFrom: 'tom'
         }.to_json

    json_data = JSON.parse(response.body)
    expect(json_data.fetch('errors', [])).to eq []
    expect(response).to have_http_status(400)
  end
end