# A base class to build scoped and optimized SQL queries based on a
# GraphQL query. Provides basic filtering and ordering operations alongside
# with sparse language field selection.
class Resolvers::BaseQueryBuilder
  include Resolvers::BaseQueryBuilderMethods

  def initialize(
    model_class,
    scope:, order_field:, order_dir:, context: nil,
    filter: nil,
    order: nil,
    languages: nil
  )
    @model_class = model_class
    @context = context
    @languages = relevant_languages(languages)
    @order_dir = order_dir
    @order_field = order_field
    scope = select_relevant_fields(scope)
    scope = apply_filter(scope, filter)
    @scope = apply_order(scope, order)

    # TODO: This should happen when loading queries from disk, not for every query
    return unless context and context.query

    @scope = include_related(@scope, context.query.query_string)
  end
end
