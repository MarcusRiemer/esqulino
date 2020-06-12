module Types
  class BaseEnum < GraphQL::Schema::Enum
    def self.enum_values
      values.values.map(&:value)
    end

    class LanguageEnum < Types::BaseEnum
      graphql_name 'LanguageEnum'
      #Available Languages
      value 'de'
      value 'en'
    end

    class OrderDirectionEnum < Types::BaseEnum
      graphql_name 'OrderDirectionEnum'
      #Order Fields
      value 'asc'
      value 'desc'
    end
  end
end
