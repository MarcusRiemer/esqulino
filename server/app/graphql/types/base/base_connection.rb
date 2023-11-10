module Types
  class Types::Base::BaseConnection < GraphQL::Types::Relay::BaseConnection
    field :total_count, Integer, null: false

    def total_count
      # Using class select to disable AS statements in sql.
      # Example for invalid query might be: SELECT COUNT(id, SLICE(name, ARRAY['de', 'en']) AS name) FROM "projects"

      if object.items.is_a?(ActiveRecord::Relation)
        return 0 if object.items.empty?

        object.items[0].class.select('id').from(object.items.reselect(object.items[0].class.table_name + '.id')).count

      else
        object.items.reselect('id').count
      end
    end
  end
end
