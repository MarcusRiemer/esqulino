class Mutations::Projects::RemoveMemberFromParticipantGroup < Mutations::Projects::Projects
  argument :group_id, ID, required: true
  argument :user_id, ID, required: true

  field :project, Types::ProjectType, null: true

  def resolve(group_id:, user_id:)
    group = Project.find_by_slug_or_id!(group_id)
    user = User.find(user_id)

    raise ArgumentError, 'The Project must be a group of a course.' if group.based_on_project.nil?

    course = Project.find(group.based_on_project.id)

    raise ArgumentError, 'Can´t delete a Group with submissions' if group.assignment_submissions.count > 0

    authorize course, :remove_member?

    if group.is_already_in_project?(user) && !group.owner?(user)
      group.project_members.find_by(user_id: user.id).destroy!
    else
      raise ArgumentError, 'The User is not a member of this participant group'
    end

    { project: course }
  end
end
