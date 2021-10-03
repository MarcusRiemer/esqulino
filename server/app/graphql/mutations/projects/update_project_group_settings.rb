class Mutations::Projects::UpdateProjectGroupSettings < Mutations::Projects::Projects
  argument :id, ID, required: true

  argument :maxGroupSize, Integer, required: false
  argument :maxNumberOfGroups, Integer, required: false
  argument :selectionGroupType, Types::ProjectType::SelectionGroupTypeEnum, required: false
  argument :enrollmentStart, GraphQL::Types::ISO8601DateTime, required: false
  argument :enrollmentEnd, GraphQL::Types::ISO8601DateTime, required: false
  argument :public, Boolean, required: false

  field :project, Types::ProjectType, null: false

  def resolve(**args)
    course = Project.find_by_slug_or_id! args[:id]
    authorize course, :update?



    group_size_present = args.key?(:maxGroupSize) && args[:maxGroupSize].present?
    raise ArgumentError, 'The maximum size of groups must not be less than 0'    if group_size_present  && args[:maxGroupSize] < 0

    raise ArgumentError, 'You must set a max group size' if !group_size_present  &&  !course.max_group_size.present?

    number_of_groups_present= args.key?(:maxNumberOfGroups) && args[:maxNumberOfGroups].present?
    raise ArgumentError, 'The maximum number of groups must not be less than 0' if number_of_groups_present && args[:maxNumberOfGroups] < 0

    enrollments_present= args.key?(:enrollmentStart) && args.key?(:enrollmentEnd) && args[:enrollmentStart].present? && args[:enrollmentEnd].present?
    raise ArgumentError, 'The end date must be higher than the start date' if enrollments_present && (args[:enrollmentStart] >= args[:enrollmentEnd])

    raise ArgumentError, 'For the type fixed_number_of_groups you must set the maxNumberOfGroups ' if !course.max_number_of_groups.present? && !args.key?(:maxNumberOfGroups) && args.key?(:selectionGroupType) && args[:selectionGroupType] == 'fixed_number_of_groups'

    args = underscore_keys(args)
    course.assign_attributes(args)

    course.enrollment_start = args[:enrollment_start]
    course.enrollment_end = args[:enrollment_end]

    course.save!

    { project: course }
  end
end
