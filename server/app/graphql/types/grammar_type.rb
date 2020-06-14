module Types
  class Types::GrammarType < Types::BaseObject
    field :name, String, null:false
    field :slug, String, null:true
    field :model, GraphQL::Types::JSON, null:false
    field :createdAt, Types::Datetime, null:false
    field :updatedAt, Types::Datetime, null:false
    field :programmingLanguageId,  String,null:true
    field :programmingLanguage, Types::ProgrammingLanguageType,null:true
    field :generatedFrom, Types::CodeResourceType, null:true
    field :blockLanguages, Types::BlockLanguageType.connection_type, null:true
    field :codeResources, Types::CodeResourceType.connection_type, null:true

    class OrderFieldEnum < Types::BaseEnum
      graphql_name 'GrammarOrderFieldEnum'
      #Order Fields
      value 'name'
      value 'slug'
    end

    class OrderType < Types::BaseInputObject
      graphql_name 'GrammarOrderType'
      argument :orderField, OrderFieldEnum, required: false
      argument :orderDirection, Types::BaseEnum::OrderDirectionEnum, required: false
    end

    class MultilingualColumnsEnum < Types::BaseEnum
      graphql_name 'GrammarMultilingualColumnsEnum'
    end

    class FilterFieldType < Types::BaseInputObject
      graphql_name 'GrammarFilterFieldType'
      argument :id, type: String, required: false
      argument :name, type: String, required: false
      argument :slug, type: String, required: false
    end

    class InputType < Types::BaseInputObject
      graphql_name 'GrammarInputType'
      argument :order, OrderType, required: false
      argument :filter, FilterFieldType, required: false
      argument :languages, [Types::BaseEnum::LanguageEnum], required: false
    end

  end
end
