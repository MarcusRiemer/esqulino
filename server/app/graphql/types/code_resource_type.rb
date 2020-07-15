module Types
  class Types::CodeResourceType < Types::Base::BaseObject
    field :id, ID, null:false
    field :name, String, null:false
    field :ast, Types::Scalar::NodeDescription, null:true
    field :project, Types::ProjectType,null:false
    field :blockLanguage, Types::BlockLanguageType,null:false
    field :programmingLanguage, Types::ProgrammingLanguageType,null:false
    field :programmingLanguageId, ID,null:false
    field :compiled, String, null:true
    field :grammars, Types::GrammarType, null:true

    field :createdAt, GraphQL::Types::ISO8601DateTime, null:true
    field :updatedAt, GraphQL::Types::ISO8601DateTime, null:true

    class OrderFieldEnum < Types::Base::BaseEnum
      graphql_name 'CodeResourceOrderFieldEnum'
      #Order Fields
      value 'name'
    end

    class OrderType < Types::Base::BaseInputObject
      graphql_name 'CodeResourceOrderType'
      argument :orderField, OrderFieldEnum, required: false
      argument :orderDirection, Types::Base::BaseEnum::OrderDirectionEnum, required: false
    end

    # Can be used if name field become multilingual
    class MultilingualColumnsEnum < Types::Base::BaseEnum
      graphql_name 'CodeResourceMultilingualColumnsEnum'
    end

    class FilterFieldType < Types::Base::BaseInputObject
      graphql_name 'CodeResourceFilterFieldType'
      argument :id, type: ID, required: false
      argument :name, type: String, required: false
      argument :programmingLanguageId, type: ID, required: false
    end

    class InputType < Types::Base::BaseInputObject
      graphql_name 'CodeResourceInputType'
      argument :order, OrderType, required: false
      argument :filter, FilterFieldType, required: false
      argument :languages, [Types::Base::BaseEnum::LanguageEnum], required: false
    end
  end
end
