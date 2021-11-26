module Types
  class Types::Base::BaseEnum < GraphQL::Schema::Enum

    class LanguageEnum < Types::Base::BaseEnum
      graphql_name 'LanguageEnum'
      # Available Languages
      value 'en'
      value 'de'
    end

    class OrderDirectionEnum < Types::Base::BaseEnum
      graphql_name 'OrderDirectionEnum'
      # Order Fields
      value 'asc'
      value 'desc'
    end

    class TextLengthOptionsEnum < Types::Base::BaseEnum
      graphql_name 'TextLengthOptionsEnum'
      value 'short'
      value 'long'
    end
  end
end
