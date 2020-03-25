module Types
  class MutationType < Types::BaseObject
    field :create_grammar, mutation: Mutations::CreateGrammarMutation
  end
end
