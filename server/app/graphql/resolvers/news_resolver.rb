
module Resolvers
  class NewsResolver < BaseResolver

    attr_reader(:scope)

    def initialize(context:nil,filter:nil,order:nil,languages:nil)
      # query context instance of GraphQL::Query::Context
      scope = News

      #requested_columns(context).filter {|c| c.ends_with?("_id")}.each do |col|
      #table = col[0,col.length-3].to_sym
      #       scope = scope.left_joins(table).select(' grammars.id AS grammar_id').group('block_languages.id, grammars.id')
      #
      #end

      unless (requested_columns(context) & ["user_id"]).empty?
        # grammar_name will be used for field resolving in block_language_type.rb
        # Used to solve n+1 query problem
        scope = scope.left_joins(:user).select(' users.id AS user_id').group('news.id, users.id')
      end

      super(News,context:context,scope:scope,filter:filter,order:order,languages:languages)
    end

    def default_order_field
      "title"
    end

  end
end
