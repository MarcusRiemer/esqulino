require_dependency 'error'

class News < ApplicationRecord
  include LocaleHelper

  scope :scope_single_language, -> (language) {
    raise EsqulinoMessageError.new("Invalid language: #{language}") unless ["de", "en"].include? language

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
  # @param languages [String] Language codes to render. Renders all languages
  #                           if parameter is nil.
  # @return [Hash<String, String>] Rendered content in asked languages
  def rendered_text(languages = nil)
    markdown = Redcarpet::Markdown.new(Redcarpet::Render::HTML, extensions = {})

    if (languages)
      check_languages(languages)
      rendered_hash = self.text.slice(*languages)
    else
      check_languages(LocaleHelper.allowed_languages_s)
      rendered_hash = self.text
    end

    rendered_hash.map { |key, value| rendered_hash[key] = markdown.render(value) }

    return rendered_hash
  end

  def check_languages(languages)
    if (!languages.all? { |entry| self.text.key? entry })
      raise EsqulinoMessageError.new("A language in your array wasn't found")
    end
  end

  def published?
    Date.today >= self.published_from
  end

  def to_full_api_response
    to_json_api_response
  end

  def to_list_api_response
    to_json_api_response
      .slice("id", "title", "text", "publishedFrom")
  end
end
