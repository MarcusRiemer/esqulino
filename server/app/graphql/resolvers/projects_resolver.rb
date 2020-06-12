module Resolvers
  class ProjectsResolver

    attr_reader(:scope)

    def initialize(filter:nil,order:nil,languages:nil)
      scope = Project.select("*")
      scope = select_languages(scope,languages)
      scope = apply_filter(scope,filter)
      @scope = apply_order(scope,order)
    end

    def apply_filter(scope, value)
      value.to_h.each do |filter_key,filter_value|
        scope = scope.where "#{filter_key} LIKE ?", filter_value
      end
      scope
    end

    def apply_order(scope,value)
      order_key = value.to_h.stringify_keys.fetch("orderField","name")
      order_dir = value.to_h.stringify_keys.fetch("orderDirection", "asc")
      scope.order "#{order_key} #{order_dir}"
    end

    def select_languages(scope, value)
      Types::ProjectType::ProjectMultiLanguageFieldEnum.enum_values.each do |lang_field|
        scope = scope.select("SLICE(#{lang_field}, ARRAY#{value.to_s.gsub(/["]/,'\'')}) AS #{lang_field}")
      end
      scope
    end

  end
end