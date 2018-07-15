# A user defined view on a programming language that uses blocks. These block models
# closely rely on the grammars of their corresponding programming language.
class BlockLanguage < ApplicationRecord
  # Every language must have a name and a family assigned
  validates :name, presence: true

  # Some special languages may get a slug assigned
  validates :slug, uniqueness: true, allow_nil: true
  
  # The JSON document needs to be a valid block language
  validates :model, json_schema: 'BlockLanguageDocument'

  # The programming language that should be chosen as a default when
  # creating code resources.
  belongs_to :default_programming_language, :class_name => "ProgrammingLanguage", optional: true

  # The grammar that this block language may describe
  belongs_to :grammar

  # The generator that may have been used to generate this block language
  belongs_to :block_language_generator, optional: true

  # Computes a hash that may be sent back to the client if it requires
  # full access to the block language. This usually happens when the
  # client is working with the editor.
  def to_full_api_response
    to_list_api_response.merge(self.model)
  end

  # Computes a hash that may be sent back to the client if only superficial
  # information is required. This usually happens when the client attempts
  # to list available block languages.
  def to_list_api_response
    to_json_api_response
      .slice("id", "slug", "name", "defaultProgrammingLanguageId", "blockLanguageGeneratorId")
  end

  # Returns a nicely readable representation of name, id and slug
  def readable_identification
    "\"#{name}\" (#{slug}, #{id})"
  end
end
