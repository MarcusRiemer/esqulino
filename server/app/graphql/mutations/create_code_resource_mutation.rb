class Mutations::CreateCodeResourceMutation < Mutations::BaseMutation
  argument :name, String, required: true
  argument :ast, Types::NodeDescription, required: false
  argument :project, Types::ProjectType, required: true
  argument :blockLanguage, Types::BlockLanguageType,required:true
  argument :programmingLanguage, Types::ProgrammingLanguageType,required:true
  argument :compiled, String, required:false
  argument :grammars, Types::GrammarType, required:false

  field :grammar, Types::GrammarType, null:true
  field :errors, [String], null: false

  def resolve(name:,ast:nil,project:,blockLanguage:,programmingLanguage:,compiled:nil,grammars:nil)
    code_resource = CodeResource.new(
        name:name,
        ast:ast,
        project:project,
        programming_language_id:programmingLanguageId,
        generated_from_id:generatedFromId,
        block_language_ids:blockLanguageIds)
    if code_resource.save
      {
          code_resource: code_resource,
          errors: []
      }
    else
      {
          code_resource: nil,
          errors: code_resource.errors.full_messages
      }
    end
  end
end


