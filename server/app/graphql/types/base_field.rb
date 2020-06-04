module Types
  class BaseField < GraphQL::Schema::Field
    argument_class Types::BaseArgument

      # field :count, CountConnection, null:false
  end
end
