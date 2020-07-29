
module Resolvers
  class CodeResourceResolver < BaseResolver

    attr_reader(:scope)

    def initialize(context:nil,filter:nil,order:nil,languages:nil)
      scope = CodeResource
      unless (requested_columns(context) & ["programming_language_id"]).empty?
        # Used to solve n+1 query problem
        scope = scope.left_joins(:programming_language)
                    .select('programming_languages.id AS programming_language_id')
                    .group('code_resources.id, programming_languages.id')
      end
      super(CodeResource,context:context,scope:scope,filter:filter,order:order,languages:languages)
    end

    def default_order_field
      "name"
    end

    def default_order_dir
      "asc"
    end

  end
end
