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
  end
end
