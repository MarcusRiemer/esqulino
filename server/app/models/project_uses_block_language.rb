# Links projects and block languages, possibly contains configuration
# parameters for the used block language.
class ProjectUsesBlockLanguage < ApplicationRecord
  belongs_to :project
  belongs_to :block_language

  def readable_identification
    if block_language
      block_language.readable_identification
    else
      "(unknown used language: #{block_language_id})"
    end
  end

  # Returns a hash that contains the ID of the referenced block
  # language and possibly options for the used language.
  def to_api_response
    to_json_api_response.slice("id", "blockLanguageId")
  end
end
