# Basic building block of any language.
class Grammar < ApplicationRecord
  # A user defined name
  validates :name, presence: true

  # Some special grammars may get a slug assigned
  validates :slug, uniqueness: true, allow_nil: true
  validates :slug, format: { with: /\A[a-zA-Z][a-zA-Z0-9\-]+\z/,
                             message: "Starts with a letter, allows letters, digits and -" },
            allow_nil: true

  # The JSON document needs to be a valid grammar
  validates :model, json_schema: 'GrammarDatabaseBlob'

  belongs_to :programming_language

  # Many block languages may be based on a single grammar
  has_many :block_languages

  # Many code resources may depend on a single grammar
  has_many :code_resources, through: :block_languages

  # Grammar with properties that are relevant when listing
  scope :scope_list, -> {
    select(:id, :slug, :name, :created_at, :updated_at, :programming_language_id)
  }

  # Computes a hash that may be sent back to the client if it requires
  # full access to grammar.
  def to_full_api_response
    to_list_api_response
      .merge(self.model)
  end

  # Computes a hash that may be sent back to the client if only superficial
  # information is required. This usually happens when the client attempts
  # to list available grammars.
  def to_list_api_response
    to_json_api_response
      .slice("id", "slug", "name", "technicalName", "programmingLanguageId")
  end
end
