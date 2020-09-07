module Mutations
  class BaseMutation < GraphQL::Schema::RelayClassicMutation
    argument_class Types::Base::BaseArgument
    field_class Types::Base::BaseField
    input_object_class Types::Base::BaseInputObject
    object_class Types::Base::BaseObject

    # Used for authentication
    include Pundit

    # Pundit requires a `current_user` method to be available
    attr_reader :current_user

    # Used to extract the current user from the context
    def initialize(object:, context:, field:)
      super
      # Using fetch because this must not fail
      @current_user = context.fetch(:user)
    end

    def underscore_keys(args)
      args.transform_keys{|k| k.to_s.underscore.to_sym}
    end
  end
end
