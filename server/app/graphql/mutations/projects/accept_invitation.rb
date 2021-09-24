class Mutations::Projects::AcceptInvitation < Mutations::Projects::Projects
  argument :project_id, ID, required: true

  field :project, Types::ProjectType, null: true

  def resolve(project_id:)
    project = Project.find_by_slug_or_id!(project_id)

    authorize project, :accept_invitation?

    member = project.project_members.find_by(user_id: current_user.id)

    raise ArgumentError, 'The invitation has already been accepted' if member.joined_at.present?

    member.joined_at = Date.today
    member.save!


    project
  end
end
