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

  # validates :types, json_schema: 'NamedLanguages'
  # validates :foreign_types, json_schema: 'NamedLanguages'
  # validates :root, json_schema: 'QualifiedTypeName'

  # The programming language that may define additional validation
  belongs_to :programming_language

  # A grammar may be based on a meta grammar code resource
  belongs_to :generated_from, class_name: 'CodeResource', optional: true

  # Many block languages may be based on a single grammar
  has_many :block_languages

  # Many code resources may depend on a single grammar
  has_many :code_resources, through: :block_languages

  # Grammar with properties that are relevant when listingpr
  scope :scope_list, lambda {
    select(:id, :slug, :name, :created_at, :updated_at, :programming_language_id)
  }

  # The parts of this model that together validate against GrammarDocument
  def document
    self.model
  end

  # Takes the current state of the backing code resource and assigns
  # the newly generated model.
  #
  # @param ide_service [IdeService] A connection to the ide service
  #        that may be used to generate the source code.
  #
  # @raise [IdeServiceError] If anything goes wrong during compilation.
  #
  # @return [Grammar|BlockLanguage] A list of affected grammars or block languages.
  def regenerate_from_code_resource!(ide_service = IdeService.instance)
    compiled = self.generated_from.emit_ast!(ide_service)
    grammar_document = JSON.parse(compiled)
    model_attributes = grammar_document.slice('types', 'foreignTypes', 'root')

    affected = []

    # Can't use ActiveModel::Dirty because this relies on saves to the database
    # as anchor points. It will therefore not tell us whether the two hashes
    # are equal or not, but if the hash in the model has been written to.
    #
    # In this method we want to know whether this concrete regenenaration changed
    # something in practice. Otherwise we might kick off loads of unnecessary
    # processing for block languages and that might be costly.
    if (not self.model.eql? model_attributes)
      self.model = model_attributes
      affected << self

      # Possibly update block languages
      self.block_languages.each do |b|
        if b.regenerate_from_grammar!
          affected << b
        end
      end
    end

    return affected
  end

  # Computes a hash that may be sent back to the client if it requires
  # full access to grammar.
  def to_full_api_response
    to_list_api_response
      .merge(self.model)
  end

  # Computes a hash that may be sent back to the client if only superficial
  # information is required. This usually happens when the client attempts
  # to list available grammars.
  def to_list_api_response(options: {})
    to_json_api_response
      .slice("id", "slug", "name", "technicalName", "programmingLanguageId", "generatedFromId")
  end
end
