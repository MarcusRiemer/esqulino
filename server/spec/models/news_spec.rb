# frozen_string_literal: true

require 'rails_helper'

RSpec.describe News, type: :model do
  it 'default values of news' do
    news = build(:news)
    expect(news.valid?).to be true
  end

  it 'invalid language in title' do
    news = build(:news, title: { 'nope' => 't' })

    news.validate
    expect(news.errors['title'].length).to eq 1
  end

  it 'invalid language in text' do
    news = build(:news, text: { 'nope' => 't' })

    news.validate
    expect(news.errors['text'].length).to eq 1
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
    expect { News.scope_single_language('abc') }.to raise_exception(EsqulinoError::Base)
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

  it 'renders the text' do
    orig = build(:news, text: { 'de' => '# Überschrift', 'en' => '#Headline' })

    expect(orig.rendered_text_full).to eq({ 'de' => "<h1>Überschrift</h1>\n", 'en' => "<h1>Headline</h1>\n" })
    expect(orig.rendered_text_short).to eq({ 'de' => "<h1>Überschrift</h1>\n", 'en' => "<h1>Headline</h1>\n" })
  end

  it 'renders the text (start)' do
    orig = build(:news, text: { 'de' => '<!-- SNIP --> # Überschrift', 'en' => '#Headline' })
    expect(orig.rendered_text_short)
      .to eq({ 'de' => '', 'en' => "<h1>Headline</h1>\n" })
  end

  it 'renders the text (mid)' do
    orig = build(:news, text: {
                   'de' => '# Überschrift <!-- SNIP --> Test',
                   'en' => '#Headline <!-- SNIP --> Test'
                 })

    expect(orig.rendered_text_short)
      .to eq({ 'de' => "<h1>Überschrift</h1>\n", 'en' => "<h1>Headline</h1>\n" })
  end

  it 'renders the text (end)' do
    orig = build(:news, text: { 'de' => '# Überschrift Test <!-- SNIP -->', 'en' => '#Headline Test <!-- SNIP -->' })

    expect(orig.rendered_text_short)
      .to eq({ 'de' => "<h1>Überschrift Test</h1>\n", 'en' => "<h1>Headline Test</h1>\n" })
  end
end
