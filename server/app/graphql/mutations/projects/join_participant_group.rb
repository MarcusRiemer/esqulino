class Mutations::Projects::JoinParticipantGroup < Mutations::Projects::Projects
  argument :group_id, ID, required: true

  field :project, Types::ProjectType, null: true

  def resolve(group_id:)
    group = Project.find_by_slug_or_id!(group_id)

    raise ArgumentError, 'The Group must be a participant group' unless group.is_participant_course

    course = group.based_on_project

    raise ArgumentError, 'The course need a max_group_size' unless course.max_group_size.present?

    raise ArgumentError, 'The max_group_size must be higher then 0' if course.max_group_size <= 0

    raise ArgumentError, 'Group is full' if course.max_group_size <= group.members.count

    raise ArgumentError, 'Not supported selection_group_type: ' + course.selection_group_type.to_s if !course.selection_group_type.present? || course.selection_group_type != 'self_selection'

    authorize course, :join_Participant_group?

    ActiveRecord::Base.transaction do
      if course.is_already_a_participant?(current_user)
        group_with_user = course.participant_projects.find { |group| group.members.any? { |member| member.id == current_user.id } }
        group_with_user.project_members.find_by(user_id: current_user.id).destroy!
      end

      group.project_members.create(user_id: current_user.id, membership_type: 'participant', joined_at: Date.today)
    end

    {project: group}
  end
end
