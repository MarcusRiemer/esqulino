module Types
  class Types::CodeResourceType < Types::Base::BaseObject
    field :id, ID, null:false
    field :name, String, null:false
    field :ast, Types::Scalar::NodeDescription, null:true
    field :project, Types::ProjectType,null:false
    field :createdAt, Types::Scalar::Datetime, null:true
    field :updatedAt, Types::Scalar::Datetime, null:true
    field :blockLanguage, Types::BlockLanguageType,null:false
    field :programmingLanguage, Types::ProgrammingLanguageType,null:false
    field :compiled, String, null:true
    field :grammars, Types::GrammarType, null:true
  end
end
