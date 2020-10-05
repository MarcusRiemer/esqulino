module Types
  class Types::ProgrammingLanguageType < Types::Base::BaseObject
    field :id, ID, null: false
    field :name, String, null: false
  end
end
