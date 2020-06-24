module Types
  class Types::Base::BaseEnum < GraphQL::Schema::Enum
    def self.enum_values
      values.values.map(&:value)
    end

    class LanguageEnum < Types::Base::BaseEnum
      graphql_name 'LanguageEnum'
      #Available Languages
      value 'de'
      value 'en'
    end

    class OrderDirectionEnum < Types::Base::BaseEnum
      graphql_name 'OrderDirectionEnum'
      #Order Fields
      value 'asc'
      value 'desc'
    end
  end
end
