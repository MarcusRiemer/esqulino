class Mutations::Projects::AddMembers < Mutations::BaseMutation
    argument :project_id, ID, required: true
    argument :user_ids, [ID], required: true
    argument :is_admin, Boolean, required: true

    field :project, Types::ProjectType, null: true

    def resolve(project_id:, user_ids:, is_admin:)
      project = Project.find_by_slug_or_id! (project_id)
      authorize project, :add_member?
      ActiveRecord::Base.transaction do
        user_ids.each do |id|
          project = Mutations::Projects::AddMembers.helper_add_one_member(project, id, is_admin, current_user)
        end
      end
      
      return ({
        project: project
      })
    rescue ActiveRecord::RecordNotFound => e
      return (e)
    end

    def self.helper_add_one_member(project, user_id, is_admin, current_user)
      
      user = User.find(user_id)

      if(project.is_already_in_project?(user))
        raise ArgumentError.new "User is already member"
      end

      if(project.user_have_role(current_user, ["participant"]) && (is_admin || !project.public))
        raise Pundit::NotAuthorizedError
      end

      if is_admin
        project.project_members.create(user_id: user.id, membership_type: "admin")
      else
        project.project_members.create(user_id: user.id, membership_type: "participant")
      end

      return project
    end
  end
  