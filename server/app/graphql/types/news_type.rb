module Types
  class Types::NewsType < Types::BaseObject
    field :title, Types::LanguageStringType, null:false
    field :text, Types::LanguageStringType, null:false
    field :publishedFrom, GraphQL::Types::ISO8601DateTime, null:true
    field :createdAt, GraphQL::Types::ISO8601DateTime, null:false
    field :updatedAt, GraphQL::Types::ISO8601DateTime, null:false
    field :user, Types::UserType, null:true

    class OrderFieldEnum < Types::BaseEnum
      graphql_name 'NewsOrderFieldEnum'
      #Order Fields
      value 'title'
      value 'publishedFrom'
      value 'createdAt'
      value 'updatedAt'
    end

    class NewsOrderType < Types::BaseInputObject
      argument :orderField, OrderFieldEnum, required: false
      argument :orderDirection, Types::BaseEnum::OrderDirectionEnum, required: false
    end
  end
end