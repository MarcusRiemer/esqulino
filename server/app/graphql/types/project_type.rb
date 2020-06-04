module Types
  class Types::ProjectType < Types::BaseObject
    field :name, String, null:false
    field :description, String, null:false
    field :public, Boolean,null:true
    field :preview, String, null:true
    field :indexPageId, String, null:true
    field :createdAt, Types::Datetime, null:true
    field :updatedAt, Types::Datetime, null:true
    field :slug, String, null:true
    field :defaultDatabase, Types::ProjectDatabaseType,null:true
    field :user, Types::UserType,null:true
    field :codeResources, Types::CodeResourceType.connection_type, null:true,connection:true
    field :projectSources, [Types::ProjectSourceType], null:true
    field :blockLanguages, [Types::BlockLanguageType], null:true
    field :grammars, [Types::GrammarType],null:true
  end
end