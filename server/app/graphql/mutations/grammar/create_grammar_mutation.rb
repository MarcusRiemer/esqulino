class Mutations::Grammar::CreateGrammarMutation < Mutations::Grammar::GrammarMutation

  argument :name, String, required: true
  argument :slug, String, required: false
  argument :types, GraphQL::Types::JSON, required:true
  argument :foreign_types, GraphQL::Types::JSON, required:true
  argument :root, GraphQL::Types::JSON, required:true
  argument :programming_language_id,  ID, required: true
  argument :generated_from_id, ID, required: false

  def resolve(**args)
    grammar = Grammar.new(args)
    save_grammar(grammar)
  end
end


