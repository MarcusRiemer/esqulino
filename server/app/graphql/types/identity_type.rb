module Types
  class Types::IdentityType < Types::Base::BaseObject
    field :provider, String, null:false
    field :type, String, null:false
    field :providerData, GraphQL::Types::JSON, null:true
    field :ownData, GraphQL::Types::JSON, null:true
    field :user, Types::UserType,null:false
    field :createdAt, Types::Scalar::Datetime, null:true
    field :updatedAt, Types::Scalar::Datetime, null:true
  end
end
