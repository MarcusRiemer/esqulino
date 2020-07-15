class Mutations::Grammar::UpdateGrammarMutation < Mutations::Grammar::GrammarMutation

  argument :id, ID, required: true
  argument :name, String, required: true
  argument :slug, String, required: false
  argument :types, GraphQL::Types::JSON, required:false
  argument :foreign_types, GraphQL::Types::JSON, required:false
  argument :root, GraphQL::Types::JSON, required:false
  argument :programming_language_id,  ID, required: false
  argument :generated_from_id, ID, required: false
  argument :block_language_ids, [ID], required: false

  def resolve(**args)
    grammar = Grammar.find(args[:id])
    grammar.assign_attributes args

    # Possibly update the code resource that this grammar is based on
    if args.key? "generated_from_id"
      grammar.generated_from_id = params.fetch("generated_from_id", nil)
    end

    # Possibly update the root node
    if args.key? "root"
      grammar.root = params.fetch("root", nil)
    end
    save_grammar(grammar)
  end
end


