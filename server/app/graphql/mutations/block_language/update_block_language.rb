class Mutations::BlockLanguage::UpdateBlockLanguage < Mutations::BlockLanguage::BlockLanguage
  argument :id, ID, required: false
  argument :name, String, required: false
  argument :slug, String, required: false
  argument :defaultProgrammingLanguageId, ID, required: false
  argument :grammarId, ID, required: false
  argument :sidebars, GraphQL::Types::JSON, required: false
  argument :editorBlocks, GraphQL::Types::JSON, required: false
  argument :rootCssClasses, GraphQL::Types::JSON, required: false
  argument :editorComponents, GraphQL::Types::JSON, required: false
  argument :localGeneratorInstructions, GraphQL::Types::JSON, required: false

  def resolve(**args)
    begin
      underscore_args = args.transform_keys { |a| a.to_s.underscore}

      block_lang = BlockLanguage.find args[:id]
      block_lang.assign_attributes underscore_args

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
    rescue ActiveRecord::RecordNotFound
      {
        news: nil,
        errors: ["Couldn't find BlockLanguage with 'id'/'slug'=#{needle}"]
      }
    end
  end
end
