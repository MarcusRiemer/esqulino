class Mutations::Projects::AddMemberToGroup < Mutations::Projects::Projects
  argument :group_id, ID, required: true
  argument :user_id, ID, required: true
  argument :role, String, required: true

  def resolve(group_id:, user_id:, role:)
    group = Project.find_by_slug_or_id!(group_id)

    user = User.find(user_id)

    raise ArgumentError, 'The Project must be a group of a course.' if group.based_on_project.nil?

    course = group.based_on_project

    raise ArgumentError, 'Can´t delete a Group with submissions' if group.assignment_submissions.count > 0

    authorize course, :destroy_project_course_participation?

    raise ArgumentError, 'User is already a participant of this course' if course.is_already_a_participant?(user)

    raise ArgumentError, 'User is member of the root course' if course.is_already_in_project?(user)

    group.project_members.create(user_id: user.id, membership_type: role)
  end
end
