module Types
  class Types::CodeResourceType < GraphQL::Schema::Object
    field :name, String, null:false
    field :ast, Types::Json, null:true
    field :project, Types::ProjectType,null:false
    field :createdAt, Types::Datetime, null:false
    field :updatedAt, Types::Datetime, null:false
    field :blockLanguage, Types::BlockLanguageType,null:false
    field :programmingLanguage, Types::ProgrammingLanguageType,null:false
    field :compiled, String, null:true
    field :grammars, Types::GrammarType, null:true
  end
end
