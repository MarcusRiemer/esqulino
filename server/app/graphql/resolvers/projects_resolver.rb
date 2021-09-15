class Resolvers::ProjectsResolver < Resolvers::BaseResolver
  def resolve(
        filter: nil,
        languages: nil,
        order: nil,
        first_only:
      )

    scope = Project

    # Limit non-admin users to their own or public projects
    # TODO: Also allow them to view projects that they have
    #       read or write access to.
    if not current_user.has_role? :admin
      scope = scope.where(public: true).or(scope.where(user_id: current_user.id))
    end

    # Maybe a user wants to see all public projects but not the ones
    # he owns or he is associated with?
    if (not filter.nil? and filter.fetch(:omit_associated, false))
      # TODO: Also filter out projects that they have read
      #       or write access to.
      scope = scope.where.not(user_id: current_user.id)
    end

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
end
