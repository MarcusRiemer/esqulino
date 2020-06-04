module Types
  class Types::RoleType < Types::BaseObject
    field :users, [Types::UserType], null:true
    field :name, String, null:true
    field :resourceId, String, null:true
    field :resourceType, String, null:true
    field :createdAt, Types::Datetime, null:false
    field :updatedAt, Types::Datetime, null:false
  end
end