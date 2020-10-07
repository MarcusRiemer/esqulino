module Types
  class MutationType < Types::Base::BaseObject
    field :create_grammar, mutation: Mutations::Grammar::CreateGrammar
    field :update_grammar, mutation: Mutations::Grammar::UpdateGrammar
    field :destroy_grammar, mutation: Mutations::Grammar::DestroyGrammar
    field :regenerate_foreign_types, mutation: Mutations::Grammar::RegenerateForeignTypes
    field :create_block_language, mutation: Mutations::BlockLanguage::CreateBlockLanguage
    field :update_block_language, mutation: Mutations::BlockLanguage::UpdateBlockLanguage
    field :destroy_block_language, mutation: Mutations::BlockLanguage::DestroyBlockLanguage
    field :create_news, mutation: Mutations::News::CreateNews
    field :update_news, mutation: Mutations::News::UpdateNews
    field :destroy_news, mutation: Mutations::News::DestroyNews
    field :create_project, mutation: Mutations::Projects::CreateProject
    field :destroy_project, mutation: Mutations::Projects::DestroyProject
    field :update_project, mutation: Mutations::Projects::UpdateProject
    field :add_used_block_language, mutation: Mutations::Projects::AddUsedBlockLanguage
    field :remove_used_block_language, mutation: Mutations::Projects::RemoveUsedBlockLanguage
  end
end
