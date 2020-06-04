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
    field :blockLanguages, [Types::BlockLanguageType], null:true
    field :codeResources, [Types::CodeResourceType], null:true
  end
end
