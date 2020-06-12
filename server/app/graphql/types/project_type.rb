module Types
  class Types::ProjectType < Types::BaseObject

    field :name, Types::LangJson, null: false
    field :description, String, null:false
    field :public, Boolean,null:true
    field :preview, String, null:true
    field :indexPageId, String, null:true
    field :createdAt, Types::Datetime, null:true
    field :updatedAt, Types::Datetime, null:true
    field :slug, String, null:true
    field :defaultDatabase, Types::ProjectDatabaseType.connection_type,null:true
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

    class MultiLanguageFieldEnum < Types::BaseEnum
      graphql_name 'ProjectMultiLanguageFieldEnum'
      value "name"
      value "description"
    end

    class ProjectOrderType < Types::BaseInputObject
      argument :orderField, OrderFieldEnum, required: false
      argument :orderDirection, Types::BaseEnum::OrderDirectionEnum, required: false
    end

    class ProjectFilterFieldType < Types::BaseInputObject
      argument :id, type: String, required: false
      argument :name, type: String, required: false
      argument :slug, type: String, required: false
      argument :public, type: Boolean, required: false
    end

    class ProjectInputType < Types::BaseInputObject
      argument :order, ProjectOrderType, required: false
      argument :filter, ProjectFilterFieldType, required: false
      argument :languages, [Types::BaseEnum::LanguageEnum], required: false
    end
  end
end