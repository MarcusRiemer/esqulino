class Mutations::Grammar::CreateGrammar < Mutations::Grammar::Grammar

  argument :name, String, required: true
  argument :slug, String, required: false
  argument :types, GraphQL::Types::JSON, required:true
  argument :foreign_types, GraphQL::Types::JSON, required:false
  argument :root, Types::Scalar::QualifiedTypeName, required:false
  argument :programming_language_id,  ID, required: true
  argument :generated_from_id, ID, required: false

  def resolve(**args)
    grammar = Grammar.new(args)
    save_grammar(grammar)
  end
end


