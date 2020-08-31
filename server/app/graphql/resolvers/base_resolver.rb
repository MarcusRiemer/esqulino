
module Resolvers
  class BaseResolver

    def initialize(model_class,context:nil,scope:,filter:nil,order:nil,languages:nil,order_field:,order_dir:)
      @model_class = model_class
      @context = context
      @languages = languages.nil? ? [@context[:language]] : languages
      @order_dir = order_dir
      @order_field = order_field
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
      value.to_h.transform_keys{|k| k.to_s.underscore}.each do |filter_key,filter_value|
        if is_uuid_column? filter_key
          scope = scope.where "#{@model_class.table_name}.#{filter_key}::text LIKE ?", filter_value
        elsif is_multilingual_column? filter_key
          scope = scope.where("'#{filter_value}' ILIKE ANY (#{@model_class.table_name}.#{filter_key} -> ARRAY#{to_single_quotes_array(@languages)})")
        elsif is_boolean_column? filter_key
          scope = scope.where "#{@model_class.table_name}.#{filter_key} = ?", filter_value
        elsif is_datetime_column? filter_key
          comparator = filter_value[:until] ? "<=" : ">"
          date = filter_value[:date] ? filter_value[:date] : Date.today
          scope = scope.where "#{@model_class.table_name}.#{filter_key} #{comparator} ?", date
        else
          scope = scope.where "#{@model_class.table_name}.#{filter_key} LIKE ?", filter_value
        end
      end
      scope
    end

    def apply_order(scope,value)
      order_key = value.to_h.stringify_keys.fetch("orderField",@order_field).underscore
      order_dir = value.to_h.stringify_keys.fetch("orderDirection", @order_dir)
      if is_multilingual_column? order_key
        # Use @languages arr and order key to make a string like "name->'de',name->'en',name->'it',name->'fr'"
        # Using gsub to add comma as delimiter
        coalesce = @languages.map{|l| "#{@model_class.table_name}.#{order_key}->'#{l}'"}.join(',')
        scope = scope.order Arel.sql("COALESCE(#{coalesce}) #{order_dir}")
      else
        scope = scope.order "#{@model_class.table_name}.#{order_key} #{order_dir}"
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
      "[#{arr.map{|e| "'#{e}'"}.join(", ")}]"
    end

    # list the requested columns except additional columns which doesnt exist in the Model like (projects codeResourceCount)
    # also add primary key and foreign key columns (columns which ends with _id) to keep relations.
    # if no columns are requested select all
    def relevant_columns
      if requested_columns(@context).empty?
        @model_class.attribute_names
      else
        @model_class.attribute_names & requested_columns(@context) | @model_class.attribute_names.filter {|f| f.end_with?("_id")} | ["id"]
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

    def requested_columns(context)
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
      #   Contains all requested nodes like id, slug, name, [...]
      # context should never be nil, unless in tests
      if  context.nil?
        []
      else
        model_query = context.query.lookahead.ast_nodes[0].selections[0]
        nodes = model_query.children.find {|c| c.name == "nodes"}
        nodes.nil? ? [] : nodes.selections.map {|s| s.name.underscore}
      end
    end

    def is_multilingual_column?(name)
      is_type_column?(name: name,type: :hstore)
    end

    def is_uuid_column?(name)
      is_type_column?(name: name,type: :uuid)
    end

    def is_boolean_column?(name)
      is_type_column?(name: name,type: :boolean)
    end

    def is_datetime_column?(name)
      is_type_column?(name: name,type: :datetime)
    end

    def is_type_column?(name:,type:)
      col = @model_class.columns_hash[name]
      col ? col.type == type : false
    end
  end
end