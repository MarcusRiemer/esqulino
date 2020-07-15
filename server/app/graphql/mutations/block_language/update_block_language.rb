class Mutations::BlockLanguage::UpdateBlockLanguage < Mutations::BlockLanguage::BlockLanguage

  argument :name, String, required: true
  argument :slug, String, required: false
  argument :defaultProgrammingLanguageId, ID, required:false
  argument :grammarId, ID, required:false
  argument :sidebars, GraphQL::Types::JSON,required: true
  argument :editorBlocks, GraphQL::Types::JSON,required: true
  argument :rootCssClasses, GraphQL::Types::JSON,required: false
  argument :editorComponents, GraphQL::Types::JSON,required: true
  argument :localGeneratorInstructions, GraphQL::Types::JSON,required: false

  def resolve(**args)
    params = ActionController::Parameters.new(args)
    needle = id_params(params)[:id].nil? ? id_params(params)[:slug] : id_params(params)[:id]
    block_lang = if BlattwerkzeugUtil::string_is_uuid? needle then
                   BlockLanguage.find needle
                 else
                   BlockLanguage.find_by! slug: needle
                 end
    block_lang.assign_attributes basic_params(params)
    block_lang.model = model_params(params)
    if block_lang.save
      {
          id: block_lang[:id],
          errors: []
      }
    else
      {
          id: nil,
          errors: block_lang.errors.full_messages
      }
    end
  end
end