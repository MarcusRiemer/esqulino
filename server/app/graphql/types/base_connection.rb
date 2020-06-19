module Types
  class Types::BaseConnection < GraphQL::Types::Relay::BaseConnection

    field :total_count, Integer, null: false

    def total_count
      # Using class select to disable AS statements in sql.
      # Example for invalid query might be: SELECT COUNT(id, SLICE(name, ARRAY['de', 'en']) AS name) FROM "projects"
      # Not using reselect to prevent unexpected behaviour when using joins
      if object.items.is_a?(ActiveRecord::Relation) && !object.items.empty?
        object.items[0].class.select("id").from(object.items.reselect(object.items[0].class.table_name+".id")).count
      else
        object.items.reselect('id').count
      end
    end
  end
end
