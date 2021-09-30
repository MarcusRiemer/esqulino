module Types
  class Types::RoleType < Types::Base::BaseObject
    field :id, ID, null: false
    field :users, [Types::UserType], null: true
    field :name, String, null: true

    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: false
  end
end
