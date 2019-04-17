require 'rails_helper'

require_dependency 'error'

RSpec.describe News, type: :model do
  it 'default values of news' do
    news = build(:news)
    expect(news.title['de']).to eq('Schlagzeile')
    expect(news.title['en']).to eq('Headline')
    expect(news.text['de']).to eq('Das ist ein Test')
    expect(news.text['en']).to eq('This is a test')
    expect(news.published_from.strftime('%F')).to eq("2019-04-10")
  end

  it 'can news be published?' do
    news = create(:news)
    expect(news.published?).to eq(true)
    expect(News.count).to eq(1)
  end

  it 'id is generated' do
    n = create(:news)
    expect(n.id).not_to be_nil
  end

  it 'creating 2 news' do
    create(:news)
    create(:news)

    expect(News.count).to eq(2)
  end

  it 'select only current languages (de) ' do
    orig = create(:news)
    n = News.scope_single_language('de').first
    expect(n.title['de']).to eq(orig.title['de'])
    expect(n.title['en']).to be_nil
    expect(n.text['de']).to eq(orig.text['de'])
    expect(n.text['en']).to be_nil
  end

  it 'select invalid language' do
    expect{News.scope_single_language('abc')}.to raise_exception(EsqulinoMessageError)
  end

  it 'select only current languages (en) ' do
    orig = create(:news)
    n = News.scope_single_language('en').first
    expect(n.title['en']).to eq(orig.title['en'])
    expect(n.title['de']).to be_nil
    expect(n.text['en']).to eq(orig.text['en'])
    expect(n.text['de']).to be_nil
  end

  it 'select all columns ' do
    orig = create(:news)
    n = News.scope_single_language('de').first
    expect(n.id).to eq(orig.id)
    expect(n.published_from).to eq(orig.published_from)
    expect(n.updated_at).to be_within(1.second).of Time.now
    expect(n.created_at).to be_within(1.second).of Time.now
  end
end
