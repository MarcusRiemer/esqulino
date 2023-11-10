class Mutations::Projects::RemoveMember < Mutations::BaseMutation
  argument :project_id, ID, required: true
  argument :user_id, ID, required: true

  field :project, Types::ProjectType, null: true

  def resolve(project_id:, user_id:)
    project = Project.find_by_slug_or_id!(project_id)
    authorize project, :remove_member?

    user = User.find(user_id)

    # A participant can delete himself from the group
    raise Pundit::NotAuthorizedError if project.member_role(current_user) == 'participant' && !(current_user.eql? user)

    raise ArgumentError, 'Can´t delete the the owner' if project.owner?(user)

    project.project_members.find_by(user_id: user.id).destroy! if project.is_already_in_project?(user)

    {
      project:
    }
  rescue ActiveRecord::RecordNotFound => e
    (e)
  end
end
