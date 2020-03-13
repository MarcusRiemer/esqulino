module Types
  class Types::ProjectType < GraphQL::Schema::Object
    field :name, String, null:true
    field :description, String, null:true
    field :public, Boolean,null:false
    field :preview, String, null:true
    field :indexPageId, String, null:true
    field :createdAt, Types::Datetime, null:false
    field :updatedAt, Types::Datetime, null:false
    field :slug, String, null:true
    field :defaultDatabase, Types::ProjectDatabaseType,null:true
    field :user, Types::UserType,null:true
  end
end