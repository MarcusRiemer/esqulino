module Types
  class Types::BlockLanguageType < Types::Base::BaseObject
    field :id, ID, null:false
    field :name, String, null:false
    field :slug, String, null:true

    field :sidebars, GraphQL::Types::JSON, null:false
    field :editorBlocks, GraphQL::Types::JSON, null:false
    field :editorComponents, GraphQL::Types::JSON, null:false
    field :localGeneratorInstructions, GraphQL::Types::JSON, null:true
    field :rootCssClasses, [String], null:false

    field :defaultProgrammingLanguage, Types::ProgrammingLanguageType,null:false
    field :defaultProgrammingLanguageId, ID,null:false
    field :grammar, Types::GrammarType, null:true
    field :grammarId, ID, null: true
    field :generated, Boolean, null:true
    field :codeResources, [Types::CodeResourceType], null:true

    field :createdAt, GraphQL::Types::ISO8601DateTime, null:true
    field :updatedAt, GraphQL::Types::ISO8601DateTime, null:true

    def generated
      # generated defined in grammars.rb in scope
      normalize_keys(object)["generated"]
    end

    def grammar_id
      # generated defined in grammars.rb in scope
      normalize_keys(object)["grammar_id"]
    end

    def default_programming_language_id
      # coming from BlockLanguage.scope_list
      normalize_keys(object)["default_programming_language_id"]
    end

    class OrderFieldEnum < Types::Base::BaseEnum
      graphql_name 'BlockLanguageOrderFieldEnum'
      #Order Fields
      value 'name'
      value 'slug'
      value 'grammar'
    end

    class OrderType < Types::Base::BaseInputObject
      graphql_name 'BlockLanguageOrderType'
      argument :orderField, OrderFieldEnum, required: false
      argument :orderDirection, Types::Base::BaseEnum::OrderDirectionEnum, required: false
    end

    class MultilingualColumnsEnum < Types::Base::BaseEnum
      graphql_name 'BlockLanguageMultilingualColumnsEnum'
    end

    class FilterFieldType < Types::Base::BaseInputObject
      graphql_name 'BlockLanguageFilterFieldType'
      argument :id, type: ID, required: false
      argument :name, type: String, required: false
      argument :slug, type: String, required: false
      argument :grammar, type: String, required: false
    end

    class InputType < Types::Base::BaseInputObject
      graphql_name 'BlockLanguageInputType'
      argument :order, OrderType, required: false
      argument :filter, FilterFieldType, required: false
      argument :languages, [Types::Base::BaseEnum::LanguageEnum], required: false
    end
  end
end
