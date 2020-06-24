class Mutations::Grammar::DestroyGrammarMutation < Mutations::Grammar::GrammarMutation

  argument :id, ID, required: true

  def resolve(id:)
    grammar = Grammar.find(id)
    destroy_grammar(grammar)
  end
end



