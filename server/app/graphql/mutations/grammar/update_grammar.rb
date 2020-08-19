class Mutations::Grammar::UpdateGrammar < Mutations::Grammar::Grammar

  argument :id, ID, required: false
  argument :name, String, required: false
  argument :slug, String, required: false
  argument :types, GraphQL::Types::JSON, required:false
  argument :foreign_types, GraphQL::Types::JSON, required:false
  argument :root, Types::Scalar::QualifiedTypeName, required:false
  argument :programming_language_id,  ID, required: false
  argument :generated_from_id, ID, required: false
  argument :block_language_ids, [ID], required: false

  def resolve(**args)
    begin
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
    rescue ActiveRecord::RecordNotFound
      {
          news: nil,
          errors: ["Couldn't find Grammar with 'id'=#{args[:id]}"]
      }
    end
  end
end


