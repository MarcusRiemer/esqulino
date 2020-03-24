module Types
  class Types::ProgrammingLanguageType < GraphQL::Schema::Object
    field :name, String, null:false
  end
end
