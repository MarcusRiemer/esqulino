module Types
  class Types::ProjectDatabaseType < Types::Base::BaseObject
    field :id, ID, null:false
    field :name, String, null:true
    field :project, Types::ProjectType,null:true
    field :schema, GraphQL::Types::JSON, null:true

    field :createdAt, GraphQL::Types::ISO8601DateTime, null:false
    field :updatedAt, GraphQL::Types::ISO8601DateTime, null:false
  end
end