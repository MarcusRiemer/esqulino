module Types
  class Types::BaseConnection < GraphQL::Types::Relay::BaseConnection

    field :total_count, Integer, null: false

    def total_count
      # Using class select to disable AS statements in sql.
      # Example for invalid query might be: SELECT COUNT(id, SLICE(name, ARRAY['de', 'en']) AS name) FROM "projects"
      object.items.reselect('id').count
    end
  end
end
