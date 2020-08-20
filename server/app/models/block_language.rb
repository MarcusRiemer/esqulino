# A user defined view on a programming language that uses blocks. These block models
# closely rely on the grammars of their corresponding programming language.
class BlockLanguage < ApplicationRecord
  # In progress: Pulling out model type
  self.ignored_columns = ['model']

  # Every language must have a name and a family assigned
  validates :name, presence: true

  # Some special languages may get a slug assigned
  validates :slug, uniqueness: true, allow_nil: true, length: { minimum: 1 }

  # The JSON documents needs to describe a valid block language
  validates :sidebars, json_schema: 'BlockLanguageSidebarsDescription'
  validates :editor_blocks, json_schema: 'BlockLanguageEditorBlocksDescription'
  validates :editor_components, json_schema: 'BlockLanguageEditorComponentsDescription'
  validates :local_generator_instructions, json_schema: 'BlockLanguageGeneratorDocument'

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
           "(block_languages.model->'localGeneratorInstructions') IS NOT NULL AS generated")
  }


  # Uses the associated grammar and the generator instructions to re-generate
  # the visual blocks for this language.
  #
  # @param ide_service [IdeService] A connection to the ide service
  #        that may be used to generate the source code.
  #
  # @raise [IdeServiceError] If anything goes wrong during generation.
  def emit_generated_blocks!(ide_service = IdeService.instance)
    regenerated = ide_service.emit_generated_blocks(self)
    if regenerated
      model_attributes = regenerated.slice(
        "rootCssClasses",
        "sidebars",
        "editorBlocks",
        "editorComponents",
      )
      self.model = self.model.merge model_attributes
      return model_attributes
    else
      return nil
    end
  end

  # Takes the current state of the backing grammar and regenerates
  # the generated blocks.
  #
  # @param ide_service [IdeService] A connection to the ide service
  #        that may be used to generate the source code.
  #
  # @raise [IdeServiceError] If anything goes wrong during generation.
  def regenerate_from_grammar!(ide_service = IdeService.instance)
    not emit_generated_blocks!(ide_service).nil?
  end

  # Computes a hash that may be sent back to the client if it requires
  # full access to the block language. This usually happens when the
  # client is working with the editor.
  def to_full_api_response
    to_list_api_response
      .merge(self.model)
  end

  # Computes a hash that may be sent back to the client if only superficial
  # information is required. This usually happens when the client attempts
  # to list available block languages.
  #
  # @param options {include_list_calculations [boolean]}
  #   True, if certain calculated values should be part of the response
  def to_list_api_response(options:{})
    response = self.to_json_api_response
                 .except "model"
    if options.fetch(:include_list_calculations, false)
      return response
    else
      return response.except("generated")
    end
  end

end
