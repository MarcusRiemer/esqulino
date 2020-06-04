module Types
  class Types::ProjectDatabaseType < Types::BaseObject
    field :name, String, null:true
    field :project, Types::ProjectType,null:true
    field :schema, GraphQL::Types::JSON, null:true
    field :createdAt, Types::Datetime, null:false
    field :updatedAt, Types::Datetime, null:false
  end
end