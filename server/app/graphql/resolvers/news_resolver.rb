module Resolvers
  class NewsResolver < BaseResolver
    attr_reader(:scope)

    def initialize(
          context: nil,
          filter: nil,
          order: nil,
          languages: nil,
          text_length: "short"
        )
      # query context instance of GraphQL::Query::Context
      scope = News

      if not ((requested_columns & ["user_id"]).empty?)
        # Used to solve n+1 query problem
        scope = scope.left_joins(:user).select(' users.id AS user_id').group('news.id, users.id')
      end
      super(News, context: context, scope: scope, filter: filter, order: order, languages: languages, order_dir: "desc", order_field: "publishedFrom")
    end

    # The rendered_text attribute requires the normal text to be present
    def additional_relevant_columns
      if not ((requested_columns & ["rendered_text_short", "rendered_text_full"]).empty?)
        ["text"]
      else
        super
      end
    end
  end
end
