require 'rails_helper'

RSpec.describe NewsController, type: :request do
  json_headers = { "CONTENT_TYPE" => "application/json" }
  
  it 'nothing published' do
    news = create(:news, published_from: Date.new(2019, 11, 1) )
    get '/api/news'
    json_data = JSON.parse(response.body)
    expect(json_data.length).to eq(0)
    # expect(json_data[0]['title']['en']).to be_nil
  end

  it 'something published' do
    news = create(:news, published_from: Date.new(2019, 1, 1) )
    get '/api/news'
    json_data = JSON.parse(response.body)
    expect(json_data.length).to eq(1)
    # expect(json_data[0]['title']['en']).to be_nil
  end

  it 'getting all news in multiple languages' do
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

  it 'updating a news' do
    news = create(:news, title: { 'de': "Schlagzeile 1", 'en': "Headline 1"}, published_from: Date.new(2019, 1, 1) )
    news_params = {
      "id" => news.id,
      "title" => { 'de': "Test" }
    }

    put "/api/news/admin",
        :headers => json_headers,
        :params => news_params.to_json

    if (not response.body.blank?) then
      json_data = JSON.parse(response.body)
      expect(json_data.fetch('errors', [])).to eq []
    end
    expect(json_data['title']['de']).to eq("Test")
    expect(json_data['title']['en']).to be_nil
  end

  it 'updating a news without a valid language' do
    news = create(:news, title: { 'de': "Schlagzeile 1", 'en': "Headline 1"}, published_from: Date.new(2019, 1, 1) )
    news_params = {
      "id" => news.id,
      "title" => { 'ab': "Test" }
    }

    put "/api/news/admin",
        :headers => json_headers,
        :params => news_params.to_json

    if (not response.body.blank?) then
      json_data = JSON.parse(response.body)
      expect(json_data.fetch('errors', [])).to eq []
    end
    expect(json_data['title']['ab']).to be_nil
  end

  it 'updating a news with a valid language and an invalid language' do
    news = create(:news, title: { 'de': "Schlagzeile 1", 'en': "Headline 1"}, published_from: Date.new(2019, 1, 1) )
    news_params = {
      "id" => news.id,
      "title" => { 'ab': "Test", 'de': "test2" }
    }

    put "/api/news/admin",
        :headers => json_headers,
        :params => news_params.to_json

    if (not response.body.blank?) then
      json_data = JSON.parse(response.body)
      expect(json_data.fetch('errors', [])).to eq []
    end
    expect(json_data['title']['ab']).to be_nil
    expect(json_data['title']['de']).to eq('test2')
  end

  it 'updating a news with an invalid date' do
    news = create(:news, title: { 'de': "Schlagzeile 1", 'en': "Headline 1"}, published_from: Date.new(2019, 1, 1) )
    news_params = {
      "id" => news.id,
      "title" => { 'de': "Test" },
      "publishedFrom" => "test"
    }

    put "/api/news/admin",
        :headers => json_headers,
        :params => news_params.to_json

    if (not response.body.blank?) then
      json_data = JSON.parse(response.body)
      expect(json_data.fetch('errors', [])).to eq []
    end

    expect(json_data['publishedFrom']).to eq("2019-01-01T00:00:00.000Z")
  end

  it 'deleting a news' do
    news = create(:news, title: { 'de': "Schlagzeile 1", 'en': "Headline 1"}, published_from: Date.new(2019, 1, 1) )

    delete "/api/news/admin/single/#{news.id}"

    expect(News.all.where('id = ?', news.id).first).to be_nil
  end

  it 'deleting a news with an invalid id' do
    news = create(:news, title: { 'de': "Schlagzeile 1", 'en': "Headline 1"}, published_from: Date.new(2019, 1, 1) )
    count_news = News.all.count
    uuid = SecureRandom.uuid
    delete "/api/news/admin/single/#{uuid}"

    expect(count_news).to eq(News.all.count)
  end

  it 'creating a news' do
    count_news = News.all.count
    post "/api/news/admin/create", params: { title: { 'de': 'Test' }, text: { 'de': 'Test2' } }

    if (not response.body.blank?) then
      json_data = JSON.parse(response.body)
      expect(json_data.fetch('errors', [])).to eq []
    end

    expect(json_data['id']).to_not be_nil
    expect(json_data['text']).to_not be_nil
    expect(json_data['title']).to_not be_nil
    expect(count_news).to_not eq(News.all.count)
  end
end