module Resolvers
  class ProjectsResolver < Resolvers::BaseResolver

    attr_reader(:scope)

    def initialize(filter:nil,order:nil,languages:nil)
      scope = select_scalar_fields()
      scope, languages = select_languages(scope,languages)
      scope = apply_filter(scope,filter,languages)
      @scope = apply_order(scope,order,languages)
    end

    def select_scalar_fields
      Project.select(scalar_columns)
    end

    def select_languages(scope, languages)
      languages = Types::BaseEnum::LanguageEnum.enum_values if languages.nil?
      Types::ProjectType::MultilingualColumnsEnum.enum_values.each do |lang_field|
        scope = scope.select("SLICE(#{lang_field}, ARRAY#{to_single_quotes_array(languages)}) AS #{lang_field}")
      end
      [scope, languages]
    end

    def apply_filter(scope, value, languages)
      # When filtering via pattern matching
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
        order_key = value.to_h.stringify_keys.fetch("orderField","name")
        order_dir = value.to_h.stringify_keys.fetch("orderDirection", "asc")
        if is_multilingual_column? order_key
          # Use languages arr and order key to make a string like "name->'de',name->'en',name->'it',name->'fr'"
          # Using gsub to add comma as delimiter
          coalesce = languages.inject(""){|acc,val| acc + "#{order_key}->'#{val}'"}.gsub(/'#{order_key}/,"', #{order_key}")
          scope = scope.order "COALESCE(#{coalesce}) #{order_dir}"
        else
          scope = scope.order "#{order_key} #{order_dir}"
        end
      end
      scope
    end

    def multilingual_columns
      Types::ProjectType::MultilingualColumnsEnum.enum_values
    end

    def scalar_columns
      Project.attribute_names.filter do |n|
        not is_multilingual_column? n
      end
    end

    def is_multilingual_column?(name)
      self.multilingual_columns.include? name.to_s
    end

  end
end
