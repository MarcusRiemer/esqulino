module Types
  class Types::Base::BaseInputObject < GraphQL::Schema::InputObject
    argument_class Types::Base::BaseArgument

    class LanguagesFieldType < Types::Base::BaseInputObject
      graphql_name 'Languages_Input_Field'
      argument :lang, type: [Types::Base::BaseEnum::LanguageEnum], required: false
    end

    class DateTimeFilterType < Types::Base::BaseInputObject
      argument :date, type: GraphQL::Types::ISO8601DateTime, required: false
      argument :until, type: Boolean, required: true
    end
  end
end
