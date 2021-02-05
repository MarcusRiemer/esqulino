module Types
  class Types::GrammarType < Types::Base::BaseObject
    field :id, ID, null: false
    field :name, String, null: false
    field :slug, String, null: true

    field :types, GraphQL::Types::JSON, null: false, default_value: {}
    field :foreign_types, GraphQL::Types::JSON, null: false, default_value: {}
    field :visualisations, GraphQL::Types::JSON, null: false, default_value: {}
    field :foreign_visualisations, GraphQL::Types::JSON, null: false, default_value: {}
    field :root, Types::Scalar::QualifiedTypeName, null: true

    field :includes, [ID], null: true
    field :visualizes, [ID], null: true

    field :programming_language_id, ID, null: false
    field :programming_language, Types::ProgrammingLanguageType, null: false

    field :generated_from_id, ID, null: true
    field :generated_from, Types::CodeResourceType, null: true

    field :block_languages, Types::BlockLanguageType.connection_type, null: true
    field :code_resources, Types::CodeResourceType.connection_type, null: true

    field :createdAt, GraphQL::Types::ISO8601DateTime, null: false
    field :updatedAt, GraphQL::Types::ISO8601DateTime, null: false

    class OrderFieldEnum < Types::Base::BaseEnum
      graphql_name 'GrammarOrderFieldEnum'
      # Order Fields
      value 'name'
      value 'slug'
    end

    class OrderType < Types::Base::BaseInputObject
      graphql_name 'GrammarOrderType'
      argument :orderField, OrderFieldEnum, required: false
      argument :orderDirection, Types::Base::BaseEnum::OrderDirectionEnum, required: false
    end

    class MultilingualColumnsEnum < Types::Base::BaseEnum
      graphql_name 'GrammarMultilingualColumnsEnum'
    end

    class FilterFieldType < Types::Base::BaseInputObject
      graphql_name 'GrammarFilterFieldType'
      argument :id, type: ID, required: false
      argument :name, type: String, required: false
      argument :slug, type: String, required: false
    end

    class InputType < Types::Base::BaseInputObject
      graphql_name 'GrammarInputType'
      argument :order, OrderType, required: false
      argument :filter, FilterFieldType, required: false
      argument :languages, [Types::Base::BaseEnum::LanguageEnum], required: false
    end
  end
end
