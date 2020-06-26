module Types
  class Types::RoleType < Types::Base::BaseObject
    field :id, ID, null:false
    field :users, [Types::UserType], null:true
    field :name, String, null:true
    field :resourceId, String, null:true
    field :resourceType, String, null:true
    field :createdAt, Types::Scalar::Datetime, null:false
    field :updatedAt, Types::Scalar::Datetime, null:false
  end
end