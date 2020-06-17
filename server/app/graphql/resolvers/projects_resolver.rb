module Resolvers
  class ProjectsResolver < Resolvers::BaseResolver

    attr_reader(:scope)

    def initialize(filter:nil,order:nil,languages:nil)
      super(Project,filter:filter,order:order,languages:languages)
    end

    def default_order_field
      "name"
    end

    def is_multilingual_column?(name)
      name.to_s == "name" || name.to_s == "description"
    end

  end
end
