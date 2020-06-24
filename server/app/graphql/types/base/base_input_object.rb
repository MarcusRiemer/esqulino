module Types
  class Types::Base::BaseInputObject < GraphQL::Schema::InputObject
    argument_class Types::Base::BaseArgument

    class LanguagesFieldType < Types::Base::BaseInputObject
      graphql_name 'Languages Input Field'
      argument :lang, type: [Types::Base::BaseEnum::LanguageEnum], required: false
    end

  end


end
