module Types
  class Types::ProjectType < Types::Base::BaseObject
    field :id, ID, null:false
    field :name, Types::Scalar::LangJson, null: false
    field :description, Types::Scalar::LangJson, null:false
    field :public, Boolean,null:true
    field :preview, String, null:true
    field :indexPageId, String, null:true
    field :slug, String, null:true
    field :defaultDatabase, Types::ProjectDatabaseType,null:true
    field :user, Types::UserType,null:true
    field :codeResources, [Types::CodeResourceType], null:true
    field :codeResourceCount, Integer, null:true
    field :projectSources, [Types::ProjectSourceType], null:true
    field :blockLanguages, [Types::BlockLanguageType], null:true
    field :grammars, [Types::GrammarType],null:true

    field :createdAt, GraphQL::Types::ISO8601DateTime, null:true
    field :updatedAt, GraphQL::Types::ISO8601DateTime, null:true

    def code_resource_count
      # code_resource_count defined in projects_resolver.rb
      object.code_resource_count
    end

    class OrderFieldEnum < Types::Base::BaseEnum
      graphql_name 'ProjectOrderFieldEnum'
      #Order Fields
      value 'name'
      value 'slug'
    end

    class OrderType < Types::Base::BaseInputObject
      graphql_name 'ProjectOrderType'
      argument :orderField, OrderFieldEnum, required: false
      argument :orderDirection, Types::Base::BaseEnum::OrderDirectionEnum, required: false
    end

    class MultilingualColumnsEnum < Types::Base::BaseEnum
      graphql_name 'ProjectMultilingualColumnsEnum'
      value "name"
      value "description"
    end

    class FilterFieldType < Types::Base::BaseInputObject
      graphql_name 'ProjectFilterFieldType'
      argument :id, type: ID, required: false
      argument :name, type: String, required: false
      argument :slug, type: String, required: false
      argument :public, type: Boolean, required: false
    end

    class InputType < Types::Base::BaseInputObject
      graphql_name 'ProjectInputType'
      argument :order, OrderType, required: false
      argument :filter, FilterFieldType, required: false
      argument :languages, [Types::Base::BaseEnum::LanguageEnum], required: false
    end
  end
end