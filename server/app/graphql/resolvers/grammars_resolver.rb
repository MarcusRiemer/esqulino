module Resolvers
  class GrammarsResolver
    attr_reader(:scope)


    def initialize(filter:nil,order:nil,languages:nil)
      scope = select_scalar_fields()
      scope = select_languages(scope,languages)
      scope = apply_filter(scope,filter)
      @scope = apply_order(scope,order)
    end

    def select_scalar_fields
      byebug
      # TODO: Explicitly select all scalar fields, but omit multilingual fields
      Project.select("*")
    end

    def select_languages(scope, value)
      Types::ProjectType::MultilingualColumnsEnum.enum_values.each do |lang_field|
        scope = scope.select("SLICE(#{lang_field}, ARRAY#{value.to_s.gsub(/["]/,'\'')}) AS #{lang_field}")
      end
      scope
    end

    def apply_filter(scope, value)
      value.to_h.each do |filter_key,filter_value|
        # TODO: Different for multingual value
        scope = scope.where "#{filter_key} LIKE ?", filter_value
      end
      scope
    end

    def apply_order(scope,value)
      if value
        if is_multilingual_column? value['orderField']
          # TODO: Different for multingual value
          order_key = value.to_h.stringify_keys.fetch("orderField","name")
          order_dir = value.to_h.stringify_keys.fetch("orderDirection", "asc")
          scope.order "#{order_key} #{order_dir}"
        else
          order_key = value.to_h.stringify_keys.fetch("orderField","name")
          order_dir = value.to_h.stringify_keys.fetch("orderDirection", "asc")
          scope.order "#{order_key} #{order_dir}"
        end
      end
      scope
    end

    def multilingual_columns
      Types::GrammarsType::MultilingualColumnsEnum.enum_values
    end

    def scalar_columns
      Project.attribute_names.filter do |n|
        not is_multilingual_column? n
      end
    end

    def is_multilingual_column?(name)
      self.multilingual_columns.include? name
    end

    #Query arguments for filtering and ordering
    #option :id, type: types.String, with: :apply_id_filter
    #option :name, type: types.String, with: :apply_name_filter
    #option :slug, type: types.String, with: :apply_slug_filter
    # option :order, type: GrammarOrderType, with: :apply_order


  end
end
