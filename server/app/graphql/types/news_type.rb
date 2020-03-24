module Types
  class Types::NewsType < GraphQL::Schema::Object
    field :title, Types::Json, null:true
    field :text, Types::Json, null:true
    field :publishedFrom, Types::Datetime, null:true
    field :createdAt, Types::Datetime, null:false
    field :updatedAt, Types::Datetime, null:false
    field :user, Types::UserType, null:true
  end
end