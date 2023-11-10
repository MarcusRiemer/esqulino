class Mutations::Projects::ChangeMemberRole < Mutations::BaseMutation
  argument :project_id, ID, required: true
  argument :user_id, ID, required: true
  argument :is_admin, Boolean, required: true

  field :project, Types::ProjectType, null: true

  def resolve(project_id:, user_id:, is_admin:)
    project = Project.find_by_slug_or_id!(project_id)
    authorize project, :change_member_role?

    user = User.find(user_id)

    raise ArgumentError, 'User is not a member' unless project.is_already_in_project?(user)

    raise ArgumentError, 'Can´t change the role of the owner' if project.owner?(user)

    membership_relation = project.project_members.find_by(user_id: user.id)

    membership_relation.membership_type = if is_admin
                                            'admin'
                                          else
                                            'participant'
                                          end

    membership_relation.save!

    {
      project:
    }
  rescue ActiveRecord::RecordNotFound => e
    (e)
  end
end
