
class Mutations::BlockLanguage::BlockLanguage < Mutations::BaseMutation

  field :blockLanguage, Types::BlockLanguageType, null: true
  field :blockLanguageDescription, Types::BlockLanguageType, null:true
  field :id, ID, null: true
  field :errors, [String], null: false

  def save_block_language(block_language)
    if block_language.save
      {
          blockLanguage: block_language,
          errors: []
      }
    else
      {
          blockLanguage: nil,
          errors: block_language.errors.full_messages
      }
    end
  end

  def destroy_block_language(block_language)
    begin
      block_language.destroy!
      {
          blockLanguage: nil,
          errors: []
      }
    rescue ActiveRecord::InvalidForeignKey
      {
          blockLanguage: nil,
          errors: ['EXISTING_REFERENCES']
      }
    end
  end

    def basic_params(params)
      params
          .permit([:name, :slug, :defaultProgrammingLanguageId, :grammarId])
          .transform_keys { |k| k.underscore }
    end

    # These parameters need to be put in the json-blob
    def model_params(params)
      # Allowing an array of arbitrary objects seems to be unsupported
      # by the strong parameters API :(
      params
          .to_unsafe_hash.slice(
          :rootCssClasses,
          :sidebars,
          :editorBlocks,
          :editorComponents,
          :localGeneratorInstructions
      ).compact
    end

    # These parameters may be used to identify a block language
    def id_params(params)
     params.permit(:id, :slug)
    end
end
