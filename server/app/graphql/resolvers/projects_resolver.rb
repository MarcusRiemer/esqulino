module Resolvers
  class ProjectsResolver < Resolvers::BaseResolver

    attr_reader(:scope)

    def initialize(context:nil,filter:nil,order:nil,languages:nil)
      # query context instance of GraphQL::Query::Context
      scope = Project

      if requested_fields(context).include?("code_resource_count")
        # code_resource_count will be used for field resolving in project_type.rb
        # Used to solve n+1 query problem
        scope = Project.left_joins(:code_resources).select('COUNT(code_resources) AS code_resource_count').group('projects.id')
      end
      super(Project,context:context,scope:scope,filter:filter,order:order,languages:languages)
    end

    def default_order_field
      "name"
    end

    def requested_fields(context)
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
      if context.nil?
        []
      else
        projects_query = context.query.lookahead.ast_nodes[0].selections[0]
        nodes = projects_query.children.find {|c| c.name == "nodes"}
        nodes.selections.map {|s| s.name.underscore}
      end
    end
  end
end
