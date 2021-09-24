class Mutations::Projects::JoinCourse < Mutations::Projects::Projects
  argument :course_id, ID, required: true

  field :project, Types::ProjectType, null: true

  def resolve(course_id:)
    course = Project.find_by_slug_or_id!(course_id)

    raise ArgumentError, 'It is not a course' unless course.is_course

    authorize course, :join_course?

    raise ArgumentError, 'That is not a possible max_group_size: ' + course.max_group_size.to_s  if course.max_group_size.nil? || course.max_group_size <= 0

    group_with_place = course.participant_projects.find { |group| group.project_members.length < course.max_group_size }

    ActiveRecord::Base.transaction do
      case course.selection_group_type
      when 'fixed_number_of_groups'
        raise ArgumentError, 'That is not a possible max_number_of_groups: ' + course.max_number_of_groups.to_s if !course.max_number_of_groups.present? || course.max_number_of_groups <= 0

        if group_with_place.present?

          group_with_place.project_members.create(user_id: current_user.id, membership_type: 'participant', joined_at: Date.today)
        elsif course.max_number_of_groups > course.participant_projects.count
          group_with_place = Mutations::Projects::CreateProjectCourseParticipation.helper_create_project_course(course, { 'de' => 'Gruppe-' + (course.participant_projects.count + 1).to_s }, [current_user.id])
        else
          raise ArgumentError, 'The Course is full'
        end
      when 'as_many_groups_as_was_created'
        if group_with_place.present?
          group_with_place.project_members.create(user_id: current_user.id, membership_type: 'participant', joined_at: Date.today)
        else
          raise ArgumentError, 'The Course is full'
        end
      when 'no_group_number_limitation'
        if group_with_place.present?
          group_with_place.project_members.create(user_id: current_user.id, membership_type: 'participant', joined_at: Date.today)
        else
          group_with_place = Mutations::Projects::CreateProjectCourseParticipation.helper_create_project_course(course, { 'de' => 'Gruppe-' + (course.participant_projects.count + 1).to_s }, [current_user.id])
        end
      else
        raise ArgumentError, 'The selection_group_type is not supported: ' + course.selection_group_type
      end
    end


    {
      project: group_with_place
    }
    
  end
end
