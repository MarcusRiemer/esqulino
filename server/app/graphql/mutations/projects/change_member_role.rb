class Mutations::Projects::ChangeMemberRole < Mutations::BaseMutation
    argument :project_id, ID, required: true
    argument :user_id, ID, required: true
    argument :is_admin, Boolean, required: true

    field :project, Types::ProjectType, null: true

    def resolve(project_id:, user_id:, is_admin:)
      project = Project.find_by_slug_or_id! (project_id)
      authorize project, :change_member_role?
     
      user = User.find(user_id)

      if(!project.is_already_in_project?(user))
        raise ArgumentError.new "User is not a member"
      end

      if(project.owner?(user))
        raise ArgumentError.new "Can´t change the role of the owner"
      end

      membership_relation = project.project_members.find_by(user_id: user.id)

      if is_admin
        membership_relation.membership_type = "admin"
      else
        membership_relation.membership_type = "participant"
      end

      membership_relation.save!
  
      return ({
          project: project
      })
    rescue ActiveRecord::RecordNotFound => e
      return (e)
    end
  end
  