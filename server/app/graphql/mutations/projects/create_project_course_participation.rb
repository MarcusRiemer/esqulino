class Mutations::Projects::CreateProjectCourseParticipation < Mutations::BaseMutation
    argument :based_on_project_id, ID, required: true
    argument :group_name, Types::Scalar::LangJson, required: true
    argument :user_ids, [ID], required: true

    field :project, Types::ProjectType, null: true

    def resolve(based_on_project_id:, user_ids:, group_name:)
      project = Project.find_by_slug_or_id! (based_on_project_id)

      authorize project, :create_project_course_participation?

      if !project.is_course() or project.based_on_project != nil
        raise ArgumentError.new("The Project must be a course and must not be a child course")
      end

      if user_ids.count == 0 
        raise ArgumentError.new("A course requires at least one participant")
      end 

      c_project = project.dup
      c_project.slug = nil
      c_project.based_on_project = project 
      c_project.public = false
      c_project.name = group_name

      ActiveRecord::Base.transaction do
      c_project.save!


      user_ids.each do |id|
        if(project.is_already_in_project?(User.find(id)))
          raise ArgumentError.new "Can´t add a member of the root course"
        end
        c_project.project_members.create(user_id: id, membership_type: "participant")
      end


      #TODO: DOn´t Copy Project 
      Mutations::Projects::CreateDeepCopyProject.helper_create_copy_of_project_uses_block_languages(project, c_project)

      Mutations::Projects::CreateDeepCopyProject.helper_create_copy_of_project_sources(project, c_project) 
      
      c_project = Mutations::Projects::CreateDeepCopyProject.helper_create_deep_copy_of_databases(project, c_project)
      
    end 
      
    #TODO:cleanup
    project = Project.find_by_slug_or_id! (based_on_project_id)
      return ({
        project: project
      })
    end

  end
  