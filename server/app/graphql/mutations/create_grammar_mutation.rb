class Mutations::CreateGrammarMutation < Mutations::BaseMutation
  argument :name, String, required: true
  argument :slug, String, required: false
  argument :model, Types::Json, required: true
  argument :programmingLanguageId,  ID, required: true
  argument :generatedFromId, ID, required: false
  argument :blockLanguageIds, [ID], required: false

  field :grammar, Types::GrammarType, null:true
  field :errors, [String], null: false

  def resolve(name:,slug:,model:,programmingLanguageId:nil,generatedFromId:nil,blockLanguageIds:nil)
    grammar = Grammar.new(
        name:name,
        slug:slug,
        model:model,
        programming_language_id:programmingLanguageId,
        generated_from_id:generatedFromId,
        block_language_ids:blockLanguageIds)
    if grammar.save
      {
          grammar: grammar,
          errors: []
      }
    else
      {
          grammar: nil,
          errors: grammar.errors.full_messages
      }
    end
  end
end


