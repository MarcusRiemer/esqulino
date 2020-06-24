module Types
  module Types::Base::BaseInterface
    include GraphQL::Schema::Interface

    field_class Types::Base::BaseField
  end
end
