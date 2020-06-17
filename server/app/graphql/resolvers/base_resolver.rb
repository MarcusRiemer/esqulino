
module Resolvers
  class BaseResolver

    def initialize(model_class,filter:nil,order:nil,languages:nil)
      @model_class = model_class
      scope = select_scalar_fields
      scope, languages = select_languages(scope,languages)
      scope = apply_filter(scope,filter,languages)
      @scope = apply_order(scope,order,languages)
    end

    def select_languages(scope, languages)
      languages = Types::BaseEnum::LanguageEnum.enum_values if languages.nil?
      multilingual_columns.each do |lang_field|
        scope = scope.select("SLICE(#{lang_field}, ARRAY#{to_single_quotes_array(languages)}) AS #{lang_field}")
      end
      [scope, languages]
    end

    def apply_filter(scope, value, languages)
      # When filtering via pattern (substring) matching
      # https://stackoverflow.com/questions/57612020/rails-hstore-column-search-for-the-same-value-in-all-keys-in-fastest-way
      value.to_h.each do |filter_key,filter_value|
        if is_multilingual_column? filter_key
          scope = scope.where("'#{filter_value}' ILIKE ANY (#{filter_key} -> ARRAY#{to_single_quotes_array(languages)})")
        else
          scope = scope.where "#{filter_key} LIKE ?", filter_value
        end
      end
      scope
    end

    def apply_order(scope,value,languages)
      if value
        order_key = value.to_h.stringify_keys.fetch("orderField",default_order_field)
        order_dir = value.to_h.stringify_keys.fetch("orderDirection", "asc")
        if is_multilingual_column? order_key
          # Use languages arr and order key to make a string like "name->'de',name->'en',name->'it',name->'fr'"
          # Using gsub to add comma as delimiter
          coalesce = languages.map{|l| "#{order_key}->'#{l}'"}.join(',')
          scope = scope.order Arel.sql("COALESCE(#{coalesce}) #{order_dir}")
        else
          scope = scope.order "#{order_key} #{order_dir}"
        end
      end
      scope
    end

    def select_relevant_fields(graphql_query)
      #TODO: find out which attributes are queried for and should be selected
    end

    def include_related(graphql_query)
      #TODO: find out which related objects are queried for and should be included
    end

    def select_scalar_fields
      @model_class.select(scalar_columns)
    end

    def escape_search_term(term)
      "%#{term.gsub(/\s+/, '%')}%"
    end

    def to_single_quotes_array(arr)
      arr.to_s.gsub(/["]/,'\'')
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

    def is_multilingual_column?(name)
      # TODO: look active record type for hstore
    end
  end
end