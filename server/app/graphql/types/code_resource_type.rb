module Types
  class Types::CodeResourceType < Types::BaseObject
    field :name, String, null:false
    field :ast, Types::NodeDescription, null:true
    field :project, Types::ProjectType,null:false
    field :createdAt, Types::Datetime, null:true
    field :updatedAt, Types::Datetime, null:true
    field :blockLanguage, Types::BlockLanguageType,null:false
    field :programmingLanguage, Types::ProgrammingLanguageType,null:false
    field :compiled, String, null:true
    field :grammars, Types::GrammarType, null:true
  end
end
