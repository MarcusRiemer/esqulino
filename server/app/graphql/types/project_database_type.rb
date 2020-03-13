module Types
  class Types::ProjectDatabaseType < GraphQL::Schema::Object
    field :name, String, null:true
    field :project, Types::ProjectType,null:true
    field :schema, Types::Json, null:true
    field :createdAt, Types::Datetime, null:false
    field :updatedAt, Types::Datetime, null:false
  end
end