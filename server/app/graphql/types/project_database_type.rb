module Types
  class Types::ProjectDatabaseType < Types::Base::BaseObject
    field :id, ID, null:false
    field :name, String, null:true
    field :project, Types::ProjectType,null:true
    field :schema, GraphQL::Types::JSON, null:true
    field :createdAt, Types::Scalar::Datetime, null:false
    field :updatedAt, Types::Scalar::Datetime, null:false
  end
end