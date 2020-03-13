module Types
  class Types::UserType < GraphQL::Schema::Object
    field :displayName, String, null:true
    field :createdAt, Types::Datetime, null:false
    field :updatedAt, Types::Datetime, null:false
    field :email, String, null:true
  end
end