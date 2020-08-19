module Types
  class Types::ProjectUsesBlockLanguageType < Types::Base::BaseObject
    field :id, ID, null:false
    field :project, Types::ProjectType, null:false
    field :projectId, ID,null:false
    field :blockLanguage, Types::BlockLanguageType, null:false
    field :blockLanguageId, ID,null:false
  end
end