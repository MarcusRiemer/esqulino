class Resolvers::ProjectsResolver < Resolvers::BaseResolver
  def resolve(
    filter: nil,
    languages: nil,
    order: nil,
    first_only:
  )

    scope = Project

    # Limit non-admin users to their own, public projects or where they are members 
    if not current_user.has_role? :admin
      scope = scope.where(public: true).or(scope.where(user_id: current_user.id)).or(scope.where('EXISTS (:project_members)', project_members: ProjectMember.select(1).where('project_members.project_id = projects.id').where('project_members.user_id = ?', current_user.id)) )
    end

    # Maybe a user wants to see all public projects but not the ones
    # he owns or he is associated with?
    if (not filter.nil? and filter.fetch(:omit_associated, false))
      scope = scope.where.not('projects.user_id = (:current_user) OR EXISTS (:project_members)', project_members: ProjectMember.select(1).where('project_members.project_id = projects.id').where('project_members.user_id = ?', current_user.id),current_user: current_user.id) 
    end


    scope = scope.where('projects.user_id = (:current_user) OR EXISTS (:project_members)', project_members: ProjectMember.select(1).where('project_members.project_id = projects.id').where('project_members.user_id = ?', current_user.id),current_user: current_user.id) if !filter.nil? && filter.fetch(:is_associated, false)

    scope = scope.where(' EXISTS (:project_members)', project_members: ProjectMember.select(1).where('project_members.project_id = projects.id').where('project_members.user_id = ?', current_user.id)) if !filter.nil? && filter.fetch(:is_member, false)

    #TODO: Rename and if this set the course_template must set
    scope = scope.where('NOT EXISTS (:participants)', participants: ProjectCourseParticipation.select('1').where('project_course_participations.based_on_project_id = projects.id').joins('LEFT JOIN project_members on project_course_participations.participant_project_id = project_members.project_id').where('project_members.user_id = ?', current_user.id)) if !filter.nil? && filter.fetch(:is_not_participant_of_course, false)

    scope = scope.where('EXISTS (:participants)', participants: ProjectCourseParticipation.select('1').where('project_course_participations.participant_project_id = projects.id')) if !filter.nil? && filter.fetch(:is_participant_course, false)


    #TODO: Should i use Date.today 
    scope = scope.where('(projects.enrollment_start IS NUll OR projects.enrollment_start <= CURRENT_DATE) AND ( projects.enrollment_end IS NULL or projects.enrollment_end >= CURRENT_DATE)') if !filter.nil? && filter.fetch(:enrollment_period_valid, false)

    scope = scope.where.not('EXISTS (:participants)', participants: ProjectCourseParticipation.select('1').where('project_course_participations.participant_project_id = projects.id')) if !filter.nil? && filter.fetch(:is_not_participant_course, false)


    if requested_columns(context).include?('code_resource_count')

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
