# Instructions on how to generate block languages from a grammar.
class BlockLanguageGenerator < ApplicationRecord
  # User defined names
  validates :name, :target_name, presence: true

  # The JSON document needs to be a valid grammar
  validates :model, json_schema: 'BlockLanguageGeneratorDocument'

  # Computes a hash that may be sent back to the client if only superficial
  # information is required. This usually happens when the client attempts
  # to list available block language generators.
  def to_list_api_response
    to_json_api_response
      .slice("id", "name", "targetName")
  end

  # Computes a hash that may be sent back to the client if it requires
  # full access to the block language generator. This usually happens when
  # some kind of administrator works on a particular language.
  def to_full_api_response
    to_list_api_response.merge(self.model)
  end
end
