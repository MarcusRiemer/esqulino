module Resolvers
  class GrammarsResolver < BaseResolver

    attr_reader(:scope)

    def initialize(context:nil,filter:nil,order:nil,languages:nil)
      # query context instance of GraphQL::Query::Context
      scope = Grammar

      super(Grammar,context:context,scope:scope,filter:filter,order:order,languages:languages)
    end

    def default_order_field
      "name"
    end

    def default_order_dir
      "asc"
    end

  end
end
