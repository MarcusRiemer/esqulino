class Mutations::Projects::CreateAssignment < Mutations::BaseMutation
  argument :project_id, ID, required: true
  argument :name, String, required: true
  argument :description, String, required: false
  argument :weight, Integer, required: false
  argument :start_date, GraphQL::Types::ISO8601DateTime, required: false
  argument :end_date, GraphQL::Types::ISO8601DateTime, required: false

  field :assignment, Types::AssignmentType, null: true

  def resolve(project_id:, name:, description: nil, start_date: nil, end_date: nil, weight: 1)
    project = Project.find_by_slug_or_id!(project_id)

    project.assert_is_root_course!
    authorize project, :create_update_assignment?

    # A project must not have any tasks
    raise ArgumentError, 'The project must be a course' unless project.is_course

    raise ArgumentError, 'The end date must be higher than the start date' if !start_date.nil? && !end_date.nil? && (start_date >= end_date)

    # project. <- trigger ich project.assignments.create
    # project.assignments.create(project_id: project.id, name: name, description: description, start_date: start_date, end_date: end_date, weight: weight)
    assignment = Assignment.create(project_id: project.id, name: name, description: description, start_date: start_date, end_date: end_date, weight: weight)

    {
      assignment: assignment # <- geift auf diese Werte zu, erst wenn hier was Fehlt wird die Methode aufgerufen
    }
  end
end
