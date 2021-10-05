class Mutations::Projects::CreateProjectCourseParticipations < Mutations::BaseMutation
  argument :based_on_project_id, ID, required: true
  argument :number_of_groups, Integer, required: true
  argument :name, String, required: true
  argument :start_name_counter, Integer, required: true

  field :project, Types::ProjectType, null: true

  def resolve(based_on_project_id:, number_of_groups:, name:, start_name_counter:)
    project = Project.find_by_slug_or_id!(based_on_project_id)

    authorize project, :create_project_course_participation?

    # TODO: Put that in the class maybe
    raise ArgumentError, 'The Project must be a course and must not be a child course' if !project.is_course || !project.based_on_project.nil?

    raise ArgumentError, 'number_of_groups must higher than 0' if number_of_groups <= 0

    raise ArgumentError, 'start_counter can´t be negativ' if start_name_counter < 0

    raise ArgumentError, 'The name of the group must not be empty' if name.empty?

    ActiveRecord::Base.transaction do
      counter = 0

      number_of_replace_symbols = 0

      if(name.present?)
        match_data = name.match /#+/
        if match_data.present?
          number_of_replace_symbols = match_data[0].length
        end
      end

      

      while counter < number_of_groups
        c_project = project.dup
        c_project.slug = nil
        c_project.based_on_project = project
        c_project.public = false
        c_project.course_template = false


        #replace the placeholder. If there are no placeholder, the name is taken without adding numbers.
        character_difference = number_of_replace_symbols - start_name_counter.digits.count
        combined_name = name.dup
        if(character_difference < 0)
          character_difference = 0
        end

        if(number_of_replace_symbols > 0)
          combined_name = combined_name.sub! "#"*number_of_replace_symbols, "0"*character_difference + start_name_counter.to_s
        end
      
        c_project.name = { 'de' => combined_name}
        c_project.save!


        # TODO: DOn´t Copy Project
        Mutations::Projects::CreateDeepCopyProject.helper_create_copy_of_project_uses_block_languages(project, c_project)

        Mutations::Projects::CreateDeepCopyProject.helper_create_copy_of_project_sources(project, c_project)

        c_project = Mutations::Projects::CreateDeepCopyProject.helper_create_deep_copy_of_databases(project, c_project)

        counter += 1
        start_name_counter += 1
      end
    end

    # TODO: cleanup
    project = Project.find_by_slug_or_id!(based_on_project_id)
    {
      project: project
    }
  end
end
