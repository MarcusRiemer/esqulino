class Mutations::Grammar::UpdateGrammar < Mutations::Grammar::Grammar
  argument :id, ID, required: false
  argument :name, String, required: false
  argument :slug, String, required: false
  argument :types, GraphQL::Types::JSON, required: false
  argument :foreign_types, GraphQL::Types::JSON, required: false
  argument :root, Types::Scalar::QualifiedTypeName, required: false
  argument :programming_language_id, ID, required: false
  argument :generated_from_id, ID, required: false

  def resolve(**args)
    grammar = Grammar.find(args[:id])
    grammar.assign_attributes args

    # Possibly update the code resource that this grammar is based on
    grammar.generated_from_id = params.fetch('generated_from_id', nil) if args.key? 'generated_from_id'

    # Possibly update the root node
    grammar.root = params.fetch('root', nil) if args.key? 'root'
    save_grammar(grammar)
  rescue ActiveRecord::RecordNotFound
    {
      news: nil,
      errors: ["Couldn't find Grammar with 'id'=#{args[:id]}"]
    }
  end
end
