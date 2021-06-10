class Resolvers::BaseResolver < GraphQL::Schema::Resolver
  include Resolvers::BaseQueryBuilderMethods

  def scope_query(
        model_class,
        context: nil,
        scope:,
        filter: nil,
        order: nil,
        languages: nil,
        order_field:,
        order_dir:
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
    if context and context.query
      include_related(context.query.query_string)
    end
  end
end