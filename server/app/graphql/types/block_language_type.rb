module Types
  class Types::BlockLanguageType < Types::BaseObject
    field :name, String, null:false
    field :model, GraphQL::Types::JSON, null:false
    field :createdAt, Types::Datetime, null:true
    field :updatedAt, Types::Datetime, null:true
    field :slug, String, null:true
    field :defaultProgrammingLanguage, Types::ProgrammingLanguageType,null:false
    field :grammar, Types::GrammarType, null:true
    field :codeResources, [Types::CodeResourceType], null:true


    class OrderFieldEnum < Types::BaseEnum
      graphql_name 'BlockLanguageOrderFieldEnum'
      #Order Fields
      value 'name'
      value 'slug'
      value 'grammar'
    end

    class BlockLanguageOrderType < Types::BaseInputObject
      argument :orderField, OrderFieldEnum, required: false
      argument :orderDirection, Types::BaseEnum::OrderDirectionEnum, required: false
    end
  end
end
