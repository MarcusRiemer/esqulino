class Mutations::Projects::CreateAssigment < Mutations::BaseMutation
    argument :project_id, ID, required: true
    argument :name, String, required: true
    argument :description, String, required: false
    argument :start_date, GraphQL::Types::ISO8601DateTime, required: false
    argument :end_date, GraphQL::Types::ISO8601DateTime, required: false

    field :project, Types::ProjectType, null: true

    def resolve(project_id:, name:, description: nil, start_date: nil, end_date: nil)
      project = Project.find_by_slug_or_id! (project_id)

      authorize project, :create_assigment?

      if start_date != nil && end_date != nil && (start_date >= end_date)
        raise ArgumentError.new "The end date must be higher than the start date"
      end

      Assigment.create(project_id: project.id, name: name, description: description, start_date: start_date, end_date: end_date)

        return ({
          project: project
        })
        end
end