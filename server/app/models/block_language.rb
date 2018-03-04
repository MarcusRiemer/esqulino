# A user defined view on a programming language that uses blocks. These block models
# closely rely on the grammars of their corresponding programming language.
class BlockLanguage < ApplicationRecord
  # Every language must have a name
  validates :name, presence: true

  # Some special languages may get a slug assigned
  validates :slug, uniqueness: true, allow_nil: true
  
  # The JSON document needs to follow the LanguageModelDescription
  validates :model, json_schema: 'BlockLanguageDocument'

  # The programming language that should be chosen as a default when
  # creating code resources.
  belongs_to :default_programming_language, :class_name => "ProgrammingLanguage", optional: true

  # Computes a hash that may be sent back to the client
  def to_full_api_response
    to_json_api_response
      .slice("id", "slug", "name", "defaultProgrammingLanguageId")
      .merge(self.model)
  end

  # Returns a nicely readable representation of id and name
  def readable_identification
    "\"#{name}\" (#{slug}, #{id})"
  end
end
