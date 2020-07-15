module Types
  class Types::RoleType < Types::Base::BaseObject
    field :id, ID, null:false
    field :users, [Types::UserType], null:true
    field :name, String, null:true
    field :resourceId, String, null:true
    field :resourceType, String, null:true

    field :createdAt, GraphQL::Types::ISO8601DateTime, null:false
    field :updatedAt, GraphQL::Types::ISO8601DateTime, null:false
  end
end