module Types
  class Types::NewsType < Types::BaseObject
    field :title, Types::LanguageStringType, null:false
    field :text, Types::LanguageStringType, null:false
    field :publishedFrom, GraphQL::Types::ISO8601DateTime, null:true
    field :createdAt, GraphQL::Types::ISO8601DateTime, null:false
    field :updatedAt, GraphQL::Types::ISO8601DateTime, null:false
    field :user, Types::UserType, null:true
  end
end