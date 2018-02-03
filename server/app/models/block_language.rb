class BlockLanguage < ApplicationRecord  
  validates :name, presence: true
  # The JSON document needs to follow the LanguageModelDescription
  validates :model, json_schema: 'BlockLanguageDocument'
end
