class Mutations::Projects::UpdateAssignment < Mutations::BaseMutation
  argument :id, ID, required: true
  argument :name, String, required: false
  argument :description, String, required: false
  argument :weight, Integer, required: false
  argument :start_date, GraphQL::Types::ISO8601DateTime, required: false
  argument :end_date, GraphQL::Types::ISO8601DateTime, required: false

  field :project, Types::ProjectType, null: true

  def resolve(**args)
    assignment = Assignment.find(args[:id])

    project = Project.find_by_slug_or_id!(assignment.project_id)

    authorize project, :create_update_assignment?

    # fürt zu problemen, wenn man mal die Daten komplett löschen möchte
    # start_date= args.key?(:start_date) ? args[:start_date]  : assignment.start_date
    # end_date = args.key?(:end_date) ? args[:end_date]  : assignment.end_date

    # TODO: Put that in the model as validater
    raise ArgumentError, 'The end date must be higher than the start date' if args.key?(:start_date) && args.key?(:end_date) && (args[:start_date] >= args[:end_date])

    assignment.assign_attributes(args)
    # It is possible that someone want to delete the deadlines.
    assignment.start_date = args[:start_date]
    assignment.end_date = args[:end_date]
    assignment.save!

    # assignment.update( name: name, description: description, start_date: start_date, end_date: end_date, weight: weight)

    {
      project: project
    }
  end
end
