# A user defined view on a programming language that uses blocks. These block models
# closely rely on the grammars of their corresponding programming language.
class BlockLanguage < ApplicationRecord
  # Every language must have a name
  validates :name, presence: true
  # The JSON document needs to follow the LanguageModelDescription
  validates :model, json_schema: 'BlockLanguageDocument'
end
