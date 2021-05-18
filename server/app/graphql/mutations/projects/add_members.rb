class Mutations::Projects::AddMembers < Mutations::BaseMutation
    argument :project_id, ID, required: true
    argument :user_id, ID, required: true
    argument :is_admin, Boolean, required: true

    class Response < Types::Base::BaseObject
      field :project, Types::ProjectType, null: false
    end
  
    field :result, Response, null: true

    def resolve(project_id, user_id, is_admin)
      project = Project.find_by_slug_or_id! (project_id)
      authorize project, :update?
      
      user = User.find(user_id)

      if(project.members.find_by(user_id: user.id))
        raise ArgumentError.new "User is allready member"
      end


      if is_admin
        m = p.members.create(user_id: user.id, membership_type: Course.roles["admin"])
      else
        m = p.members.create(user_id: user.id, membership_type: Course.roles["participant"])
      end
  
      return ({
        result: {
          project_member: m
        }
      })
    rescue Pundit::NotAuthorizedError, ActiveRecord::RecordNotFound => e
      return (e)
    end
  end
  