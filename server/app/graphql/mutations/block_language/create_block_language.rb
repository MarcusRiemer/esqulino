class Mutations::BlockLanguage::CreateBlockLanguage < Mutations::BlockLanguage::BlockLanguage

  argument :name, String, required: true
  argument :slug, String, required: false
  argument :defaultProgrammingLanguageId, ID, required:false
  argument :grammarId, ID, required:false
  argument :sidebars, GraphQL::Types::JSON,required: true
  argument :editorBlocks, GraphQL::Types::JSON,required: true
  argument :editorComponents, GraphQL::Types::JSON,required: true


  # both arguments are sliced in model_params, but are not sent to the server from
  # create-block-language.component.ts in admin backend
  # argument :rootCssClasses, GraphQL::Types::JSON,required:false
  # argument :localGeneratorInstructions, GraphQL::Types::JSON,required:false

  def resolve(**args)
    params = ActionController::Parameters.new(args)
    block_lang = BlockLanguage.new(basic_params(params))
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