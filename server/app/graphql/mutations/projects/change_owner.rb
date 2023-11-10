class Mutations::Projects::ChangeOwner < Mutations::BaseMutation
  argument :project_id, ID, required: true
  argument :user_id, ID, required: true

  field :project, Types::ProjectType, null: true

  def resolve(project_id:, user_id:)
    project = Project.find_by_slug_or_id!(project_id)
    authorize project, :change_owner?

    user = User.find(user_id)

    unless project.owner?(user)
      ActiveRecord::Base.transaction do
        project.project_members.find_by(user_id: user.id).destroy if project.is_already_in_project?(user)

        project.project_members.create(user_id: current_user.id, membership_type: 'admin')
        project.update(user:)
      end
    end

    {
      project:
    }
  rescue ActiveRecord::RecordNotFound => e
    (e)
  end
end
