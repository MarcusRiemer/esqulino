# A news with a title and some text. May be published on a certain
# date and is multilingual.
class News < ApplicationRecord
  include LocaleHelper

  attr_reader :owner

  resourcify

  belongs_to :user

  # Title may only use allowed languages
  validates :title, valid_languages: []

  # Text may only use allowed languages
  validates :text, valid_languages: []

  # Retrieve a certain news in a single language
  #
  # @param language [String] A valid language that is hopefully stored with the news
  scope :scope_single_language, -> (language) {
    raise EsqulinoError::Base.new("Invalid language: #{language}") unless LocaleHelper.allowed_languages_s.include? language

     where("title->? != '' AND text->? != ''", language, language)
    .where("published_from <= ?", Date.today)
    .limit(10)
    .select('id, published_from, created_at, updated_at')
    .select("slice(title, ARRAY['#{language}']) as title")
    .select("slice(text, ARRAY['#{language}']) as text")
    .order('published_from DESC')
  }

  # Compiles the text in the given languages to HTML
  #
  # @param languages [String[]] Language codes to render. Renders all languages
  #                           if parameter is nil.
  # @param text_length [:full | :short] choose between short/full text
  # @return [Hash<String, String>] Rendered content in asked languages
  def rendered_text(text_length: :full, languages: nil)
    raise EsqulinoMessageError.new("Invalid text_length") unless [:short, :full].include? text_length

    # Possibly restrict the languages to be rendered
    if languages
      assert_languages(languages)
      rendered_hash = self.text.slice(*languages)
    else
      rendered_hash = self.text
    end

    markdown = Redcarpet::Markdown.new(Redcarpet::Render::HTML, extensions = {})
    rendered_hash.each do |key, value|
      if text_length == :short
        pos = value.index('<!-- SNIP -->')
        if (pos)
          value = value.slice(0, pos)
        end
      end
      rendered_hash[key] = markdown.render(value)
    end
    return rendered_hash
  end

  # Asserts that the given languages are part of the text
  def assert_languages(languages)
    if (!languages.all? { |entry| self.text.key? entry })
      raise EsqulinoError::Base.new("A language in your array wasn't found")
    end
  end

  # API response for the data that is of interest in the administrative backend
  # Does **not** render the markdown, because the Admin UI should show the
  # actual markdown text.
  def to_full_api_response()
    to_json_api_response(compact: false)
  end

  # Checks if the logged in user is the owner of this news
  def owner?(user)
    return user.eql? self.user
  end

  # API response for data that is rendered on the frontpage. May restrict
  # length of the text and returned languages
  def to_frontpage_api_response(text_length: :full, languages: nil)

    to_return = to_json_api_response
                  .slice("id", "title", "text", "publishedFrom")

    if (to_return['text'])
      to_return['text'] = rendered_text(text_length: text_length, languages: languages)
    end

    return (to_return)
  end
end
