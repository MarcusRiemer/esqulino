# Basic building block of any language.
class Grammar < ApplicationRecord
  # Many block languages may be based on a single grammar
  has_many :block_language
  
  # A user defined name
  validates :name, presence: true

  # Some special languages may get a slug assigned
  validates :slug, uniqueness: true, allow_nil: true

  # The JSON document needs to be a valid grammer
  validates :model, json_schema: 'GrammarDocument'

  # Returns a nicely readable representation of id and name
  def readable_identification
    "\"#{name}\" (#{slug}, #{id})"
  end
end
