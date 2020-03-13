module Types
  class Types::GrammarType < GraphQL::Schema::Object
    field :name, String, null:false
    field :slug, String, null:true
    field :model, Types::Json, null:false
    field :createdAt, Types::Datetime, null:false
    field :updatedAt, Types::Datetime, null:false
    field :programmingLanguage, Types::ProgrammingLanguageType,null:true
    #TODO: generated_from_id ???
  end
end
