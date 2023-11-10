module Resolvers::BaseQueryBuilderMethods
  # Calculates the relevant languages based on the given languages
  def relevant_languages(languages)
    # No language given at all? Use default languages
    if languages.nil?
      %w[de en]
    # Explicitly asking for no language at all? Must be an error
    elsif languages.empty?
      raise GraphQL::ExecutionError, 'An empty Array is not allowed as languages input field.'
    # This is fine
    else
      languages
    end
  end

  def select_relevant_fields(scope)
    relevant_columns.each do |col|
      scope = if is_multilingual_column?(col)
                scope.select("SLICE(#{@model_class.table_name}.#{col}, ARRAY#{to_single_quotes_array(@languages)}) AS #{col}")
              else
                scope.select(col)
              end
    end
    scope
  end

  def apply_filter(scope, value)
    # When filtering via pattern (substring) matching
    # https://stackoverflow.com/questions/57612020/rails-hstore-column-search-for-the-same-value-in-all-keys-in-fastest-way
    value.to_h.transform_keys { |k| k.to_s.underscore }.each do |filter_key, filter_value|
      if is_uuid_column? filter_key
        if BlattwerkzeugUtil.string_is_uuid? filter_value
          scope = scope.where "#{@model_class.table_name}.#{filter_key}::text LIKE ?", filter_value
        elsif @model_class.column_names.include? 'slug'
          scope = scope.where "#{@model_class.table_name}.slug LIKE ?", filter_value
        else
          raise GraphQL::ExecutionError, "The provided filter_value #{filter_value} can not be used as needle, because its not a uuid or class #{@model_class} doesn't have slug as attribute"
        end
      elsif is_multilingual_column? filter_key
        scope = scope.where "'#{filter_value}' ILIKE ANY (#{@model_class.table_name}.#{filter_key} -> ARRAY#{to_single_quotes_array(@languages)})"
      elsif is_boolean_column? filter_key
        scope = scope.where "#{@model_class.table_name}.#{filter_key} = ?", filter_value
      elsif is_datetime_column? filter_key
        comparator = filter_value[:until] ? '<=' : '>'
        date = filter_value[:date] || Date.today
        scope = scope.where "#{@model_class.table_name}.#{filter_key} #{comparator} ?", date
      else
        scope = scope.where "#{@model_class.table_name}.#{filter_key} LIKE ?", filter_value
      end
    end
    scope
  end

  def apply_order(scope, value)
    # `#to_h` turns nil into an empty hash so we can rely on `#fetch` to
    # give us the request specific or the fallback ordering options
    order_key = value.to_h.fetch(:order_field, @order_field).underscore
    order_dir = value.to_h.fetch(:order_direction, @order_dir)

    if is_multilingual_column? order_key
      # Use @languages arr and order key to make an SQL statement like
      #   name->'de',name->'en',name->'it',name->'fr'
      # which will (together with COALESCE) pick the first matching language
      coalesce = @languages.map { |l| "#{@model_class.table_name}.#{order_key}->'#{l}'" }.join(',')
      scope = scope.order Arel.sql("COALESCE(#{coalesce}) #{order_dir}")
    else
      scope = scope.order Arel.sql("#{@model_class.table_name}.#{order_key} #{order_dir}")
    end
    scope
  end

  # Extends the scope with appropriate Rails `#includes` hints according to
  # the GraphQL query.
  def include_related(current_scope, graphql_query)
    proposed = Resolvers::RelatedModelsVisitor.calculate(graphql_query, @model_class)
    return current_scope.includes(proposed) unless proposed.empty?

    current_scope
  end

  def escape_search_term(term)
    "%#{term.gsub(/\s+/, '%')}%"
  end

  def to_single_quotes_array(arr)
    '[' + arr.map { |e| "'" + e.to_s + "'" }.join(', ') + ']'
  end

  # Returns the requested columns except for transient columns which don't exist in
  # the Model like (projects codeResourceCount). Also adds primary key and foreign key
  # columns (columns which ends with _id) to keep relations if no columns are
  # requested at all
  def relevant_columns
    column_names = if requested_columns.empty?
                     # No columns explicitly requested, hand out everything we have
                     @model_class.attribute_names
                   else
                     # All requested columns that exist directly as a column in the model
                     selectable_columns = @model_class.attribute_names & requested_columns
                     # Everything that ends in "_id"
                     fk_columns = @model_class.attribute_names.filter { |f| f.end_with?('_id') }

                     # Putting it together and always select the id
                     selectable_columns | fk_columns | ['id']
                   end

    column_names + additional_relevant_columns
  end

  # Sometimes attributes are computed at runtime from columns. An inheriting resolver may add
  # additional columns here
  def additional_relevant_columns
    []
  end

  def multilingual_columns
    @model_class.attribute_names.filter do |n|
      is_multilingual_column? n
    end
  end

  def scalar_columns
    @model_class.attribute_names.filter do |n|
      !is_multilingual_column? n
    end
  end

  def requested_columns(context = nil)
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
    context ||= @context

    if context.nil?
      []
    else
      model_query = context.query.lookahead.ast_nodes[0].selections[0]
      nodes = model_query.children.find { |c| c.name == 'nodes' }
      nodes.nil? ? [] : nodes.selections.map { |s| s.name.underscore }
    end
  end

  def is_multilingual_column?(name)
    is_type_column?(name:, type: :hstore)
  end

  def is_uuid_column?(name)
    is_type_column?(name:, type: :uuid)
  end

  def is_boolean_column?(name)
    is_type_column?(name:, type: :boolean)
  end

  def is_datetime_column?(name)
    is_type_column?(name:, type: :datetime)
  end

  def is_type_column?(name:, type:)
    col = @model_class.columns_hash[name]
    col ? col.type == type : false
  end
end
