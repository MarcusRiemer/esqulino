module Resolvers
  class ProjectsResolver < Resolvers::BaseResolver

    attr_reader(:scope)

    def initialize(context:nil,filter:nil,order:nil,languages:nil)
      # query context instance of GraphQL::Query::Context
      scope = Project

      if requested_columns(context).include?("code_resource_count")
        # code_resource_count will be used for field resolving in project_type.rb
        # Used to solve n+1 query problem
        scope = Project.left_joins(:code_resources).select('COUNT(code_resources) AS code_resource_count').group('projects.id')
      end
      super(Project,context:context,scope:scope,filter:filter,order:order,languages:languages)
    end

    def default_order_field
      "name"
    end

    def default_order_dir
      "asc"
    end

  end
end
