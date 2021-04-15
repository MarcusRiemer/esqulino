# A user defined view on a programming language that uses blocks. These block models
# closely rely on the grammars of their corresponding programming language.
class BlockLanguage < ApplicationRecord
  # In progress: Pulling out model type
  self.ignored_columns = ['model']

  # ID of the meta block language
  def self.meta_grammar_id
    Rails.application.config_for(:sqlino)
      .fetch(:seed)
      .fetch(:meta)
      .fetch(:block)
  end

  # Every language must have a name and a family assigned
  validates :name, presence: true

  # Some special languages may get a slug assigned
  validates :slug, uniqueness: true, allow_nil: true, length: { minimum: 1 }

  # The JSON documents needs to describe a valid block language
  validates :sidebars, json_schema: 'BlockLanguageSidebarsDescription'
  validates :editor_blocks, json_schema: 'BlockLanguageEditorBlocksDescription'
  validates :editor_components, json_schema: 'BlockLanguageEditorComponentsDescription'
  validates :local_generator_instructions, json_schema: 'BlockLanguageGeneratorDocument', allow_nil: true

  # The programming language that should be chosen as a default when
  # creating code resources.
  belongs_to :default_programming_language, :class_name => "ProgrammingLanguage"

  # The types of grammar may be based on a meta block language code resource
  belongs_to :generated_from, class_name: 'CodeResource', optional: true

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

  # The parts of this model that together validate against BlockLanguageDocument
  def document
    attributes
      .slice("editor_blocks", "editor_components", "sidebars", "root_css_classes", "local_generator_instructions")
      .compact
      .transform_keys { |k| k.camelize(:lower) }
  end

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
        "sidebars",
        "editor_blocks",
        "editor_components",
      )

      self.assign_attributes model_attributes
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

  # Takes the current state of the code resource that contains backing
  # instructions and regenerates the static properties accordingly.
  #
  # @param ide_service [IdeService] A connection to the ide service
  #        that may be used to generate the source code.
  #
  # @raise [IdeServiceError] If anything goes wrong during generation.
  #
  # @return [BlockLanguage[]] Every model that has been changed by regenenaration
  def regenerate_from_code_resource!(ide_service = IdeService.instance)
    generated_settings = ide_service.emit_block_lang_settings(generated_from.ast)

    self.assign_attributes generated_settings

    return [self]
  end

  # Computes a hash that may be sent back to the client if it requires
  # full access to the block language. This usually happens when the
  # client is working with the editor.
  def to_full_api_response
    self.to_json_api_response
  end

  # Computes a hash that may be sent back to the client if only superficial
  # information is required. This usually happens when the client attempts
  # to list available block languages.
  def to_list_api_response(options: {})
    response = self.to_json_api_response
                   .except("editorBlocks", "sidebars", "editorComponents", "rootCssClasses", "localGeneratorInstructions")
    if options.fetch(:include_list_calculations, false)
      return response
    else
      return response.except("generated")
    end
  end
end
