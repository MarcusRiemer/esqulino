class Resolvers::ProjectsResolver < Resolvers::BaseResolver
  def resolve(
        filter: nil,
        languages: nil,
        order: nil,
        first_only:
      )

    scope = Project

    if requested_columns(context).include?("code_resource_count")

      # code_resource_count will be used for field resolving in project_type.rb
      # Used to solve n+1 query problem
      scope = Project.left_joins(:code_resources)
                .select('COUNT(code_resources) AS code_resource_count')
                .group('projects.id')
    end

    result = scope_query(
      Project,
      context: context,
      scope: scope,
      filter: filter,
      languages: languages,
      order: order,
      fallback_order_dir: "asc",
      fallback_order_field: "name"
    )

    if first_only
      return result.first
    else
      return result
    end
  end

  class Single < Resolvers::ProjectsResolver

    argument :id, ID, required: false

    def resolve(id:)
      super(
        filter: { id: id },
        first_only: true
      )
    end
  end

  class List < Resolvers::ProjectsResolver

    argument :input, Types::ProjectType::InputType, required: false

    def resolve(input: {})
      res = super(
        **input,
        first_only: false
      )
      return res
    end
  end


  def self.connection(input = {}, context = nil)
    new(context: context, **input).scope
  end

  def self.single(id, context = nil)
    new(context: context, filter: { id: id })
      .scope
      .first
  end
end
