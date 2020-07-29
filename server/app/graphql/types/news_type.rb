module Types
  class Types::NewsType < Types::Base::BaseObject
    field :id, ID, null:false
    field :title, Types::Scalar::LangJson, null:false
    field :text, Types::Scalar::LangJson, null:false
    field :publishedFrom, GraphQL::Types::ISO8601DateTime, null:true
    field :user, Types::UserType, null:true
    field :userId, ID,null: true

    field :createdAt, GraphQL::Types::ISO8601DateTime, null:true
    field :updatedAt, GraphQL::Types::ISO8601DateTime, null:true

    class OrderFieldEnum < Types::Base::BaseEnum
      graphql_name 'NewsOrderFieldEnum'
      #Order Fields
      value 'title'
      value 'publishedFrom'
      value 'createdAt'
      value 'updatedAt'
    end

    class OrderType < Types::Base::BaseInputObject
      graphql_name 'NewsOrderType'
      argument :orderField, OrderFieldEnum, required: false
      argument :orderDirection, Types::Base::BaseEnum::OrderDirectionEnum, required: false
    end

    class MultilingualColumnsEnum < Types::Base::BaseEnum
      graphql_name 'NewsMultilingualColumnsEnum'
      value "title"
      value "text"
    end

    class FilterFieldType < Types::Base::BaseInputObject
      graphql_name 'NewsFilterFieldType'
      argument :id, type: ID, required: false
      argument :title, type: String, required: false
      argument :text, type: String, required: false
      argument :userId, type: String, required: false
      argument :publishedFrom, type: Types::Base::BaseInputObject::DateTimeFilterType, required: false
    end

    class InputType < Types::Base::BaseInputObject
      graphql_name 'NewsInputType'
      argument :order, OrderType, required: false
      argument :filter, FilterFieldType, required: false
      argument :languages, [Types::Base::BaseEnum::LanguageEnum], required: false
    end

    class AdvancedInputType < InputType
      graphql_name 'AdvancedNewsInputType'
      argument :text_length, Types::Base::BaseEnum::TextLengthOptionsEnum, required: false
    end
  end
end