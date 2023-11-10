class Mutations::Projects::AddMembers < Mutations::BaseMutation
  argument :project_id, ID, required: true
  argument :user_ids, [ID], required: true
  argument :is_admin, Boolean, required: true

  field :project, Types::ProjectType, null: true

  def resolve(project_id:, user_ids:, is_admin:)
    project = Project.find_by_slug_or_id!(project_id)
    authorize project, :add_member?
    ActiveRecord::Base.transaction do
      user_ids.each do |id|
        project = helper_add_one_member(project, id, is_admin)
      end
    end

    {
      project:
    }
  rescue ActiveRecord::RecordNotFound => e
    (e)
  end

  def helper_add_one_member(project, user_id, is_admin)
    user = User.find(user_id)

    raise ArgumentError, 'User is already member' if project.is_already_in_project?(user)

    raise Pundit::NotAuthorizedError if project.user_have_role(current_user, ['participant']) && (is_admin || !project.public)

    if is_admin
      project.project_members.create(user_id: user.id, membership_type: 'admin')
    else
      project.project_members.create(user_id: user.id, membership_type: 'participant')
    end

    project
  end
end
