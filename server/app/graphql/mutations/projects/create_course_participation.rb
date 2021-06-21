class Mutations::Projects::CreateCourseParticipation < Mutations::BaseMutation
    argument :solution_project_id, ID, required: true
    argument :user_ids, [ID], required: true
    argument :slug, String, required: false

    field :project, Types::ProjectType, null: true

    def resolve(solution_project_id:, user_ids:, slug: nil)
      project = Project.find_by_slug_or_id! (solution_project_id)


      if project.solution_project != nil
        raise ArgumentError.new("Can´t create a course project of  a participant project")
      end

      authorize project, :create_course_participation?

      #If a user want do join a project
      if project.public && !(user_ids.include? current_user.id) && !project.is_already_in_project?(current_user) 
        user_ids.push(current_user.id)
      end

      course_project = Project.new(user_id: project.user_id, slug: slug, name: project.name)
      
      ActiveRecord::Base.transaction do
        course_project.save!
        course_project.solution_project = project
        #add participants
        user_ids.each do |id|
            course_project = Mutations::Projects::AddMembers.helper_add_one_member(course_project, id, false, current_user)
        end

      end

      return ({
        project: course_project
      })
    end

  end
  