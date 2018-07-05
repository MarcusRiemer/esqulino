# Instructions on how to generate block languages from a grammar.
class BlockLanguageGenerator < ApplicationRecord
  # User defined names
  validates :name, :target_name, presence: true

  # The JSON document needs to be a valid grammar
  validates :model, json_schema: 'BlockLanguageGeneratorDocument'
end
