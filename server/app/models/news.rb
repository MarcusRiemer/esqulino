# frozen_string_literal: true

# A news with a title and some text. May be published on a certain
# date and is multilingual.
class News < ApplicationRecord
  include LocaleHelper

  belongs_to :user

  # Title may only use allowed languages
  validates :title, valid_languages: []

  # Text may only use allowed languages
  validates :text, valid_languages: []

  # Retrieve a certain news in a single language
  #
  # @param language [String] A valid language that is hopefully stored with the news
  scope :scope_single_language, lambda { |language|
    raise EsqulinoError::Base, "Invalid language: #{language}" unless LocaleHelper.allowed_languages.include? language

    where("title->? != '' AND text->? != ''", language, language)
      .where('published_from <= ?', Date.today)
      .limit(10)
      .select('id, published_from, created_at, updated_at')
      .select("slice(title, ARRAY['#{language}']) as title")
      .select("slice(text, ARRAY['#{language}']) as text")
      .order('published_from DESC')
  }

  def rendered_text_full
    impl_rendered_text(text_length: :full)
  end

  def rendered_text_short
    impl_rendered_text(text_length: :short)
  end

  # Checks if the logged in user is the owner of this news
  def owner?(user)
    user.eql? self.user
  end

  def readable_identification
    _, printed_title = title.first
    "\"#{printed_title}\" (#{id})"
  end

  private

  # Compiles the text in the given languages to HTML
  #
  # @param text_length [:full | :short] choose between short/full text
  # @return [Hash<String, String>] Rendered content in asked languages
  def impl_rendered_text(text_length:)
    raise EsqulinoMessageError, 'Invalid text_length' unless %i[short full].include? text_length

    rendered_hash = text

    markdown = Redcarpet::Markdown.new(Redcarpet::Render::HTML, {})
    rendered_hash.each do |key, value|
      if text_length == :short
        pos = value.index('<!-- SNIP -->')
        value = value.slice(0, pos) if pos
      end
      rendered_hash[key] = markdown.render(value)
    end
    rendered_hash
  end

  # Asserts that the given languages are part of the text
  def assert_languages(languages)
    return if languages.all? { |entry| text.key? entry }

    raise EsqulinoError::Base, "A language in your array wasn't found"
  end
end
