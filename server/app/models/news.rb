require_dependency 'error'

class News < ApplicationRecord

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
