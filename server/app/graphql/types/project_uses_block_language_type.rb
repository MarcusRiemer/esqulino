module Types
  class Types::ProjectUsesBlockLanguageType < Types::Base::BaseObject
    field :id, ID, null:false
    field :project, Types::ProjectType, null:false
    field :project_id, ID,null:false
    field :block_language, Types::BlockLanguageType, null:false
    field :block_language_id, ID,null:false
  end
end