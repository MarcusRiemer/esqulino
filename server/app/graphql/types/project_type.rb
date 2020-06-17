module Types
  class Types::ProjectType < Types::BaseObject

    field :name, Types::LangJson, null: false
    field :description, Types::LangJson, null:false
    field :public, Boolean,null:true
    field :preview, String, null:true
    field :indexPageId, String, null:true
    field :createdAt, Types::Datetime, null:true
    field :updatedAt, Types::Datetime, null:true
    field :slug, String, null:true
    field :defaultDatabase, Types::ProjectDatabaseType,null:true
    field :user, Types::UserType,null:true
    field :codeResources, Types::CodeResourceType.connection_type, null:true
    field :projectSources, Types::ProjectSourceType.connection_type, null:true
    field :blockLanguages, Types::BlockLanguageType.connection_type, null:true
    field :grammars, Types::GrammarType.connection_type,null:true

    class OrderFieldEnum < Types::BaseEnum
      graphql_name 'ProjectOrderFieldEnum'
      #Order Fields
      value 'name'
      value 'slug'
    end

    class OrderType < Types::BaseInputObject
      graphql_name 'ProjectOrderType'
      argument :orderField, OrderFieldEnum, required: false
      argument :orderDirection, Types::BaseEnum::OrderDirectionEnum, required: false
    end

    class MultilingualColumnsEnum < Types::BaseEnum
      graphql_name 'ProjectMultilingualColumnsEnum'
      value "name"
      value "description"
    end

    class FilterFieldType < Types::BaseInputObject
      graphql_name 'ProjectFilterFieldType'
      argument :id, type: String, required: false
      argument :name, type: String, required: false
      argument :slug, type: String, required: false
      argument :public, type: Boolean, required: false
    end

    class InputType < Types::BaseInputObject
      graphql_name 'ProjectInputType'
      argument :order, OrderType, required: false
      argument :filter, FilterFieldType, required: false
      argument :languages, [Types::BaseEnum::LanguageEnum], required: false
    end
  end
end