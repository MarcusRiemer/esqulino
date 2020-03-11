# A user defined view on a programming language that uses blocks. These block models
# closely rely on the grammars of their corresponding programming language.
class BlockLanguage < ApplicationRecord
  # Every language must have a name and a family assigned
  validates :name, presence: true

  # Some special languages may get a slug assigned
  validates :slug, uniqueness: true, allow_nil: true, length: { minimum: 1 }

  # The JSON document needs to be a valid block language
  validates :model, json_schema: 'BlockLanguageDocument'

  # The programming language that should be chosen as a default when
  # creating code resources.
  belongs_to :default_programming_language, :class_name => "ProgrammingLanguage"

  # The grammar that this block language may describe
  belongs_to :grammar

  # The code resources that are rendered using this language
  has_many :code_resources

  # A block language with only the information that is relevant when listing it.
  # Adds the following calculated fields:
  #   generated: Indicates whether this language can be generated automatically
  scope :scope_list, -> {
    select(:id, :slug, :name, :default_programming_language_id,
           :grammar_id, :created_at, :updated_at,
           "(model->'localGeneratorInstructions') IS NOT NULL AS generated")
  }

  # Computes a hash that may be sent back to the client if it requires
  # full access to the block language. This usually happens when the
  # client is working with the editor.
  def to_full_api_response
    to_list_api_response
      .except("model")
      .merge(self.model)
  end

  # Computes a hash that may be sent back to the client if only superficial
  # information is required. This usually happens when the client attempts
  # to list available block languages.
  #
  # @param options {include_list_calculations [boolean]}
  #   True, if certain calculated values should be part of the response
  def to_list_api_response(options:{})
    unless options.key?(:include_list_calculations) and options[:include_list_calculations] then
      return to_json_api_response
          .except("generated")
    end
    to_json_api_response
  end

end
