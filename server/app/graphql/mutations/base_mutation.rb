module Mutations
  class BaseMutation < GraphQL::Schema::RelayClassicMutation
    argument_class Types::Base::BaseArgument
    field_class Types::Base::BaseField
    input_object_class Types::Base::BaseInputObject
    object_class Types::Base::BaseObject
  end
end
