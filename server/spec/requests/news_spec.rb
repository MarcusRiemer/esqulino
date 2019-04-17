require 'rails_helper'

RSpec.describe NewsController, type: :request do
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
end
