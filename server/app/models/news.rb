require_dependency 'error'

class News < ApplicationRecord

  scope :scope_single_language, -> (language) {
    raise EsqulinoMessageError.new("Invalid language: #{language}") unless ["de", "en"].include? language

     where("title->? != '' AND text->? != ''", language, language)
    .where("publish_from <= ?", Date.today)
    .limit(10)
    .select('id, publish_from, created_at, updated_at')
    .select("slice(title, ARRAY['#{language}']) as title")
    .select("slice(text, ARRAY['#{language}']) as text")
    .order('publish_from DESC')
  }

  def published?
    Date.today >= self.publish_from
  end

  def to_full_api_response
    to_json_api_response
  end

  def to_list_api_response
    to_json_api_response
      .slice("id", "title", "text", "publishFrom")
  end
end
