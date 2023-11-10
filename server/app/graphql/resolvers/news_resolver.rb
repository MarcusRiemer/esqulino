class Resolvers::NewsResolver < Resolvers::BaseQueryBuilder
  attr_reader(:scope)

  def initialize(
    context: nil,
    filter: nil,
    order: nil,
    languages: nil,
    text_length: 'short'
  )
    # query context instance of GraphQL::Query::Context
    scope = News

    unless (requested_columns & ['user_id']).empty?
      # Used to solve n+1 query problem
      scope = scope.left_joins(:user).select(' users.id AS user_id').group('news.id, users.id')
    end
    super(News, context:, scope:, filter:, order:, languages:, order_dir: 'desc', order_field: 'publishedFrom')
  end

  # The rendered_text attribute requires the normal text to be present
  def additional_relevant_columns
    if (requested_columns & %w[rendered_text_short rendered_text_full]).empty?
      super
    else
      ['text']
    end
  end
end
