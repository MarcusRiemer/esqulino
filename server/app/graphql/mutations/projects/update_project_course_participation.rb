class Mutations::Projects::UpdateProjectCourseParticipation < Mutations::Projects::Projects
  argument :group_id, ID, required: true
  argument :group_name, ID, required: true

  def resolve(**_args)
    group = Project.find_by_slug_or_id!(args[:group_id])

    course = group.base_on_project

    raise ArgumentError, 'The Project must be a group of a course.' if group.based_on_project.nil?
    raise ArgumentError, 'Can´t delete a Group with submissions' if group.submissions.count > 0

    authorize course, :update_project_course_participation?

    course = group.base_on_project

    group.assign_attributes(args)
    group.save!
  rescue Pundit::NotAuthorizedError, ActiveRecord::RecordNotFound => e
    {
      errors: [e]
    }
  end
end
