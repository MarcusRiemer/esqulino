
module Resolvers
  class BaseResolver

    def initialize(model_class,context:nil,scope:,filter:nil,order:nil,languages:nil)
      @model_class = model_class
      @context = context
      @languages = languages.nil? ? Types::BaseEnum::LanguageEnum.enum_values : languages
      scope = select_relevant_fields(scope)
      scope = apply_filter(scope,filter)
      @scope = apply_order(scope,order)
    end

    def select_relevant_fields(scope)
      relevant_columns.each do |col|
        if is_multilingual_column?(col)
          scope = scope.select("SLICE(#{@model_class.table_name}.#{col}, ARRAY#{to_single_quotes_array(@languages)}) AS #{col}")
        else
          scope = scope.select(col)
        end
      end
      scope
    end

    def apply_filter(scope, value)
      # When filtering via pattern (substring) matching
      # https://stackoverflow.com/questions/57612020/rails-hstore-column-search-for-the-same-value-in-all-keys-in-fastest-way
      value.to_h.each do |filter_key,filter_value|
        if is_multilingual_column? filter_key

          scope = scope.where("'#{filter_value}' ILIKE ANY (#{filter_key} -> ARRAY#{to_single_quotes_array(@languages)})")
        else
          scope = scope.where "#{filter_key} LIKE ?", filter_value
        end
      end
      scope
    end

    def apply_order(scope,value)
      if value
        order_key = value.to_h.stringify_keys.fetch("orderField",default_order_field)
        order_dir = value.to_h.stringify_keys.fetch("orderDirection", "asc")
        if is_multilingual_column? order_key
          # Use @languages arr and order key to make a string like "name->'de',name->'en',name->'it',name->'fr'"
          # Using gsub to add comma as delimiter
          coalesce = @languages.map{|l| "#{order_key}->'#{l}'"}.join(',')
          scope = scope.order Arel.sql("COALESCE(#{coalesce}) #{order_dir}")
        else
          scope = scope.order "#{order_key} #{order_dir}"
        end
      end
      scope
    end

    def include_related(graphql_query)
      # .includes might be the wrong function because it only makes possible to use
      # .size so the number will be determined by iterating the array not in sql
      #  https://jacopretorius.net/2017/05/dealing-with-n1-queries-in-rails.html
      #TODO: find out which related objects are queried for and should be included
    end

    def escape_search_term(term)
      "%#{term.gsub(/\s+/, '%')}%"
    end

    def to_single_quotes_array(arr)
      arr.to_s.gsub(/["]/,'\'')
    end

    # list the requested columns except additional columns which doesnt exist in the Model like (projects codeResourceCount)
    # also add foreign key columns (columns which ends with _id) to keep relations.
    # if no columns are requested select all
    def relevant_columns
      if requested_columns.empty?
        @model_class.attribute_names
      else
        @model_class.attribute_names & requested_columns | @model_class.attribute_names.filter {|f| f.end_with?("_id")}
      end
    end

    def multilingual_columns
      @model_class.attribute_names.filter do |n|
        is_multilingual_column? n
      end
    end

    def scalar_columns
      @model_class.attribute_names.filter do |n|
        not is_multilingual_column? n
      end
    end

    def requested_columns
      # .query: Access GraphQL::Query instance
      # .lookahead: Access Class: GraphQL::Execution::Lookahead instance
      #   Lookahead creates a uniform interface to inspect the forthcoming selections.
      # .ast_nodes: Access to Array<GraphQL::Language::Nodes::Field> (.length always 1 for one query)
      # .selections: Access to Array<Nodes::Field> (.length always 1 for one query)
      #   .name returns to name of the query defined in query_type.rb for example "projects"
      # .children: Access to Class: GraphQL::Language::Nodes::AbstractNode instance
      #   AbstractNode is the base class for all nodes in a GraphQL AST.
      #   Seems to be the root of the field selection of a query.
      #   Contains all queried connection fields like nodes, edges, pageInfo, totalCount
      #   Also contains the provided arguments like first,last,after,before,input.
      # nodes.selections: Access to Array<Nodes::Field>
      #   Contains als requested nodes like id, slug, name, [...]
      if  @context.nil?
        []
      else
        projects_query = @context.query.lookahead.ast_nodes[0].selections[0]
        nodes = projects_query.children.find {|c| c.name == "nodes"}
        nodes.selections.map {|s| s.name.underscore}
      end
    end

    def is_multilingual_column?(name)
      @model_class.columns_hash[name.to_s].type == :hstore
    end
  end
end