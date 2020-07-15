class Mutations::Grammar::RegenerateForeignTypes < Mutations::BaseMutation

  argument :id, ID, required: true

  field :grammar, Types::GrammarType, null: false

  def resolve(**args)
    grammar = Grammar.find(args['id'])

    grammar.refresh_from_references!
    grammar.save!

    {
      grammar: grammar
    }
  end
end
