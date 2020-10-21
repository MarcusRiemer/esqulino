module Types
  class Types::UserType < Types::Base::BaseObject
    field :id, ID, null: false
    field :roles, Types::RoleType, null: false
    field :display_name, String, null: true
    field :email, String, null: true
    field :projects, [Types::ProjectType], null: true
    field :identities, [Types::IdentityType], null: true
    field :news, [Types::NewsType], null: true

    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: false
  end
end
