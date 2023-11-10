class Mutations::Grammar::RegenerateForeignTypes < Mutations::BaseMutation
  argument :id, ID, required: true

  field :grammar, Types::GrammarType, null: false

  def resolve(id:)
    grammar = Grammar.find(id)
    grammar.refresh_from_references!
    grammar.save!

    {
      grammar:
    }
  end
end
