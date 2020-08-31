module Types
  class Types::ProjectDatabaseType < Types::Base::BaseObject
    field :id, ID, null:false
    field :name, String, null:true
    field :project, Types::ProjectType,null:true
    field :schema, GraphQL::Types::JSON, null:true

    field :created_at, GraphQL::Types::ISO8601DateTime, null:false
    field :updated_at, GraphQL::Types::ISO8601DateTime, null:false
  end
end