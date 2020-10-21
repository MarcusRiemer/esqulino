module Resolvers
  class GrammarsResolver < BaseResolver
    attr_reader(:scope)

    def initialize(context: nil, filter: nil, order: nil, languages: nil)
      # query context instance of GraphQL::Query::Context
      scope = Grammar

      super(Grammar, context: context, scope: scope, filter: filter, order: order, languages: languages, order_dir: "asc", order_field: "name")
    end
  end
end
