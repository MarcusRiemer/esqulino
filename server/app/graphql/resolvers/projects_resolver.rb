class Resolvers::ProjectsResolver < Resolvers::BaseResolver
  def resolve(
    first_only:, filter: nil,
    languages: nil,
    order: nil
  )

    scope = Project

    # Limit non-admin users to their own or public projects
    # TODO: Also allow them to view projects that they have
    #       read or write access to.
    scope = scope.where(public: true).or(scope.where(user_id: current_user.id)) unless current_user.has_role? :admin

    if requested_columns(context).include?('code_resource_count')

      # code_resource_count will be used for field resolving in project_type.rb
      # Used to solve n+1 query problem
      scope = Project.left_joins(:code_resources)
                     .select('COUNT(code_resources) AS code_resource_count')
                     .group('projects.id')
    end

    result = scope_query(
      Project,
      context:,
      scope:,
      filter:,
      languages:,
      order:,
      fallback_order_dir: 'asc',
      fallback_order_field: 'name'
    )

    return result.first if first_only

    result
  end

  class Single < Resolvers::ProjectsResolver
    argument :id, ID, required: false

    def resolve(id:)
      super(
        filter: { id: },
        first_only: true
      )
    end
  end

  class List < Resolvers::ProjectsResolver
    argument :input, Types::ProjectType::ListInputType, required: false

    def resolve(input: {})
      super(
        **input,
        first_only: false
      )
    end
  end
end
