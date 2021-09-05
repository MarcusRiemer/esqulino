class Mutations::Projects::CreateProjectCourseParticipations < Mutations::BaseMutation
  argument :based_on_project_id, ID, required: true
  argument :number_of_groups, Integer, required: false

  field :project, Types::ProjectType, null: true

  def resolve(based_on_project_id:, number_of_groups:)
    project = Project.find_by_slug_or_id!(based_on_project_id)

    authorize project, :create_project_course_participation?

    # TODO: Put that in the class maybe
    raise ArgumentError, 'The Project must be a course and must not be a child course' if !project.is_course || !project.based_on_project.nil?

    raise ArgumentError, 'number_of_groups must higher than 0' if number_of_groups <= 0

    ActiveRecord::Base.transaction do
      counter = 0

      while counter < number_of_groups
        c_project = project.dup
        c_project.slug = nil
        c_project.based_on_project = project
        c_project.public = false
        c_project.name = { 'de' => 'Gruppe-' + (project.participant_projects.count + 1).to_s }
        c_project.save!

        # TODO: DOn´t Copy Project
        Mutations::Projects::CreateDeepCopyProject.helper_create_copy_of_project_uses_block_languages(project, c_project)

        Mutations::Projects::CreateDeepCopyProject.helper_create_copy_of_project_sources(project, c_project)

        c_project = Mutations::Projects::CreateDeepCopyProject.helper_create_deep_copy_of_databases(project, c_project)

        counter += 1
      end
    end

    # TODO: cleanup
    project = Project.find_by_slug_or_id!(based_on_project_id)
    {
      project: project
    }
  end
end
