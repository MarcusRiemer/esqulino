module Types
  class MutationType < Types::BaseObject
    field :create_grammar, mutation: Mutations::CreateGrammarMutation
    field :create_news, mutation: Mutations::CreateNewsMutation
  end
end
