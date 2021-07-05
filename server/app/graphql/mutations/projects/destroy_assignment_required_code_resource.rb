class Mutations::Projects::DestroyAssignmentRequiredCodeResource < Mutations::BaseMutation
    argument :id, ID, required: true
    field :project, Types::ProjectType, null: true

    def resolve(**args)
      
      assignment_required_cd = AssignmentRequiredCodeResource.find(args[:id])

     assignment = Assignment.find(assignment_required_cd.assignment_id)
    
      project = Project.find_by_slug_or_id! (assignment.project_id)

      authorize project, :destroy_assignment_required_code_resource?

      assignment_required_cd.destroy!

        return ({
          project: project
        })
        end
end