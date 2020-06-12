module Resolvers
  class ProjectsResolver


    def initialize(filter:nil,order:nil,languages:nil)
      byebug
      #This is a stub, used for indexing
    end

    def apply_filter(scope, value)
      value.to_h.each do |filter_key,filter_value|
        scope = scope.where "#{filter_key} LIKE ?", filter_value
      end
    end

    def apply_order(scope,value)
      order_key = value.to_h.stringify_keys.fetch("orderField","name")
      order_dir = value.to_h.stringify_keys.fetch("orderDirection", "asc")
      scope.order "#{order_key} #{order_dir}"
    end

    def select_languages(scope, value)
      MultiLanguageFieldEnum.enum_values.each do |lang_field|
        scope = scope.select("slice(#{lang_field}, ARRAY#{value.to_s.gsub(/["]/,'\'')}) as #{lang_field}")
      end
    end
  end
end