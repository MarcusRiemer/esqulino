module Types
  class Types::NewsType < Types::Base::BaseObject
    field :id, ID, null: false
    field :title, Types::Scalar::LangJson, null: false
    field :text, Types::Scalar::LangJson, null: false
    field :rendered_text_short, Types::Scalar::LangJson, null: false
    field :rendered_text_full, Types::Scalar::LangJson, null: false
    field :published_from, Types::Scalar::SettableDate, null: false
    field :user, Types::UserType, null: true
    field :user_id, ID, null: true

    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: false

    # if published_from is nil in database it will be converted to "UNPUBLISHED"
    def published_from
      object["published_from"].nil? ? "UNSET" : object["published_from"]
    end

    class OrderFieldEnum < Types::Base::BaseEnum
      graphql_name 'NewsOrderFieldEnum'
      # Order Fields
      value 'title'
      value 'publishedFrom'
      value 'createdAt'
      value 'updatedAt'
    end

    class OrderType < Types::Base::BaseInputObject
      graphql_name 'NewsOrderType'
      argument :order_field, OrderFieldEnum, required: false
      argument :order_direction, Types::Base::BaseEnum::OrderDirectionEnum, required: false
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
      argument :user_id, type: String, required: false
      argument :published_from, type: Types::Base::BaseInputObject::DateTimeFilterType, required: false
    end

    class InputType < Types::Base::BaseInputObject
      graphql_name 'NewsInputType'
      argument :order, OrderType, required: false
      argument :filter, FilterFieldType, required: false
      argument :languages, [Types::Base::BaseEnum::LanguageEnum], required: false
      argument :text_length, Types::Base::BaseEnum::TextLengthOptionsEnum, required: false
    end
  end
end
