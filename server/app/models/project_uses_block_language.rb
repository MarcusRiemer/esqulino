# Links projects and block languages
class ProjectUsesBlockLanguage < ApplicationRecord
  belongs_to :project
  belongs_to :block_language

  def readable_identification
    block_language.readable_identification
  end
end
