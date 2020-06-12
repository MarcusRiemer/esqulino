module Types
  class BaseInputObject < GraphQL::Schema::InputObject
    argument_class Types::BaseArgument

    class LanguagesFieldType < Types::BaseInputObject
      graphql_name 'Languages Input Field'
      argument :lang, type: [Types::BaseEnum::LanguageEnum], required: false
    end

  end


end
