module Types
  class Types::IdentityType < Types::Base::BaseObject
    field :id, ID, null: false
    field :provider, String, null: false
    field :type, String, null: false
    field :providerData, GraphQL::Types::JSON, null: true
    field :ownData, GraphQL::Types::JSON, null: true
    field :user, Types::UserType, null: false

    field :createdAt, GraphQL::Types::ISO8601DateTime, null: false
    field :updatedAt, GraphQL::Types::ISO8601DateTime, null: false
  end
end
