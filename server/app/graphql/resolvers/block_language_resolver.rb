module Resolvers
  class BlockLanguageResolver < BaseResolver
    attr_reader(:scope)

    def initialize(context: nil, filter: nil, order: nil, languages: nil)
      # query context instance of GraphQL::Query::Context
      scope = BlockLanguage.scope_list

      unless (requested_columns(context) & ["grammar_id"]).empty?
        # grammar_name will be used for field resolving in block_language_type.rb
        # Used to solve n+1 query problem
        scope = scope.left_joins(:grammar)
                  .select(' grammars.id AS grammar_id')
                  .group('block_languages.id, grammars.id')
      end

      if order.nil?
        order = { order_field: "slug", order_direction: "asc" }
      end

      super(BlockLanguage, context: context, scope: scope, filter: filter, order: order, languages: languages, order_dir: order[:order_direction], order_field: order[:order_field])
    end
  end
end
