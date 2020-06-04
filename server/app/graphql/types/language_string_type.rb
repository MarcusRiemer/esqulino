module Types
  class Types::LanguageStringType < GraphQL::Schema::Object
    field :de, String, null:true
    field :en, String, null:true
  end
end
