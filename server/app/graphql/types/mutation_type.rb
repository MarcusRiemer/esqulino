module Types
  class MutationType < Types::Base::BaseObject
    field :create_grammar, mutation: Mutations::Grammar::CreateGrammarMutation
    field :update_grammar, mutation: Mutations::Grammar::UpdateGrammarMutation
    field :destroy_grammar, mutation: Mutations::Grammar::DestroyGrammarMutation
    field :create_block_language, mutation: Mutations::BlockLanguage::CreateBlockLanguageMutation
    field :create_news, mutation: Mutations::CreateNewsMutation
  end
end
