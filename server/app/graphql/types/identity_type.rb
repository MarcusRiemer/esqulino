module Types
  class Types::IdentityType < Types::BaseObject
    field :provider, String, null:false
    field :type, String, null:false
    field :providerData, GraphQL::Types::JSON, null:true
    field :ownData, GraphQL::Types::JSON, null:true
    field :user, Types::UserType,null:false
    field :createdAt, Types::Datetime, null:true
    field :updatedAt, Types::Datetime, null:true
  end
end
