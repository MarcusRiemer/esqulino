# Basic building block of any language.
class Grammar < ApplicationRecord
  # In progress: Pulling out model type
  self.ignored_columns = ['model']

  # A user defined name
  validates :name, presence: true

  # Some special grammars may get a slug assigned
  validates :slug, uniqueness: true, allow_nil: true
  validates :slug, format: { with: /\A[a-zA-Z][a-zA-Z0-9\-]+\z/,
                             message: "Starts with a letter, allows letters, digits and -" },
            allow_nil: true

  # The JSON documents needs to be a valid grammar
  validates :types, json_schema: 'NamedLanguages'
  validates :foreign_types, json_schema: 'NamedLanguages'
  validates :root, json_schema: 'QualifiedTypeName', allow_nil: true

  # The programming language that may define additional validation
  belongs_to :programming_language

  # The types of grammar may be based on a meta grammar code resource
  belongs_to :generated_from, class_name: 'CodeResource', optional: true

  # Many block languages may be based on a single grammar
  has_many :block_languages

  # Many code resources may depend on a single grammar
  has_many :code_resources, through: :block_languages

  # All references that use this grammar as an origin
  has_many :grammar_reference_origins,
           class_name: 'GrammarReference',
           foreign_key: "origin_id",
           dependent: :destroy # Needed because Rails otherwise tries to nullify the column

  # All grammars that are referenced by this grammar
  has_many :targeted_grammars, through: :grammar_reference_origins, source: "target"

  # Grammar with properties that are relevant when listing
  scope :scope_list, lambda {
    select(:id, :slug, :name, :created_at, :updated_at, :programming_language_id)
  }

  # The parts of this model that together validate against GrammarDocument
  def document
    attributes
      .slice("types", "foreign_types", "root")
      .compact
  end

  # All types that are defined in this grammar, with locally defined types
  # taking precedence over foreign types.
  def all_types
    # This merge must be over exactly two levels: Languages must not be
    # overwritten directly, but merged. But the types inside a language
    # must **not** be merged.
    foreign_types.merge(types) do |key, foreign, local|
      foreign.merge(local)
    end
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
    grammar_document = JSON.parse(compiled || "{}")

    # The attributes that are generated by the client do not follow the
    # Ruby snake_case conventions.
    regenerated_attributes = grammar_document
                               .slice('types', 'foreignTypes', 'root')
                               .transform_keys { |k| k.underscore }

    regenerated_relationships = self.document_included_grammars grammar_document

    # Can't use ActiveModel::Dirty because this relies on saves to the database
    # as anchor points. It will therefore not tell us whether the two hashes
    # are equal or not, but if the hash in the model has been written to the database
    # after a change has been made.
    #
    # In this method we want to know whether this concrete regenenaration changed
    # something in practice. Otherwise we might kick off loads of unnecessary
    # processing for block languages and that might be costly.
    document_attributes_changed = not(document.eql? regenerated_attributes)
    document_references_changed = references_changed?(regenerated_relationships)

    # All entities that are affected if this regeneration changes something
    affected = []

    if (document_attributes_changed || document_references_changed)
      if (document_attributes_changed)
        self.assign_attributes regenerated_attributes
      end

      if (document_references_changed)
        self.grammar_reference_origins = regenerated_relationships
      end

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

  # Pulls possibly newer types from the grammar that this grammar extends. Does
  # nothing if this grammar doesn't extend another grammar.
  def refresh_from_references!
    include_types = self.grammar_reference_origins.filter do |ref|
      ref.reference_type == "include_types"
    end

    if include_types.length == 1
      self.foreign_types = include_types[0].target.all_types
    elsif include_types.length > 1
      raise EsqulinoError::Base.new("Including more than one other grammar not currently supported :(")
    end
  end

  # Computes a hash that may be sent back to the client if it requires
  # full access to grammar.
  def to_full_api_response
    includes = self.targeted_grammars.pluck(:target_id)

    to_json_api_response
      .except("model", "createdAt", "updatedAt")
      .merge({"includes" => includes})
  end

  # Computes a hash that may be sent back to the client if only superficial
  # information is required. This usually happens when the client attempts
  # to list available grammars.
  def to_list_api_response(options: {})
    to_json_api_response
      .slice("id", "slug", "name", "technicalName", "programmingLanguageId", "generatedFromId")
  end

  private

  # @param grammar_document [Hash] A GrammarDocument (or at least the portion that provides grammars)
  # @return [GrammarReference[]] An array of relevant GrammarReference instances
  def document_included_grammars(grammar_document)
    grammar_ids = grammar_document.fetch("includes", [])
    grammar_ids.map do |grammar_id|
      GrammarReference.find_or_initialize_by(
        origin: self,
        target_id: grammar_id,
        reference_type: "include_types"
      )
    end
  end

  # @param new_references [GrammarReference[]]
  #   The set of references that possibly replace the current set of references
  def references_changed?(new_references)
    if new_references.any? { |ref| not ref.persisted? }
      return true
    else
      curr_ids = targeted_grammars.map {|r| r.id}.to_set
      new_ids = new_references.map {|r| r.id}.to_set
      return not((curr_ids ^ new_ids).empty?)
    end
  end
end
