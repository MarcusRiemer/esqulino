module Types
  class Types::ProjectDatabaseType < Types::Base::BaseObject
    field :id, ID, null: false
    field :name, String, null: false
    field :project, Types::ProjectType, null: false

    field :schema, [Types::SqlTableType], null: false

    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: false
  end
end
