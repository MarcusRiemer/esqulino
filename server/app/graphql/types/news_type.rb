module Types
  class Types::NewsType < Types::Base::BaseObject
    field :id, ID, null:false
    field :title, Types::Scalar::LangJson, null:false
    field :text, Types::Scalar::LangJson, null:false
    field :publishedFrom, GraphQL::Types::ISO8601DateTime, null:true
    field :createdAt, GraphQL::Types::ISO8601DateTime, null:false
    field :updatedAt, GraphQL::Types::ISO8601DateTime, null:false
    field :user, Types::UserType, null:true

    class OrderFieldEnum < Types::Base::BaseEnum
      graphql_name 'NewsOrderFieldEnum'
      #Order Fields
      value 'title'
      value 'publishedFrom'
      value 'createdAt'
      value 'updatedAt'
    end

    class NewsOrderType < Types::Base::BaseInputObject
      argument :orderField, OrderFieldEnum, required: false
      argument :orderDirection, Types::Base::BaseEnum::OrderDirectionEnum, required: false
    end
  end
end