module Types
  class Types::Base::BaseField < GraphQL::Schema::Field
    argument_class Types::Base::BaseArgument
    def initialize(*args, default_value: nil, **kwargs, &block)
      super(*args, **kwargs, &block)
      if !default_value.nil?
        extension(DefaultValueExtension, default_value: default_value)
      end
    end
  end

  class DefaultValueExtension < GraphQL::Schema::FieldExtension
    def after_resolve(value:, **_rest)
      if value.nil?
        options[:default_value]
      else
        value
      end
    end
  end
end
