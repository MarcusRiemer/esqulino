class Mutations::Grammar::DestroyGrammar< Mutations::Grammar::Grammar

  argument :id, ID, required: true

  def resolve(id:)
    grammar = Grammar.find(id)
    destroy_grammar(grammar)
  end
end



