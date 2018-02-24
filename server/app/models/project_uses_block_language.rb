# Links projects and block languages
class ProjectUsesBlockLanguage < ApplicationRecord
  belongs_to :project
  belongs_to :block_language

  def readable_identification
    block_language.readable_identification
  end

  # Returns a hash that contains the ID of the referenced block
  # language and possibly options for the used language.
  def to_api_response
    to_json_api_response.slice("id", "blockLanguageId")
  end
end
