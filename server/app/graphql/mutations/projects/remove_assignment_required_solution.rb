
#TODO: Hier würde kein Fehler bei doppelter abfeuerung entstehen. Anders verhalten als bei den anderen 
# Könnte das ein Problem sein ? 
class Mutations::Projects::RemoveAssignmentRequiredSolution < Mutations::BaseMutation
    argument :assignment_required_code_resource_id, ID, required: true
    
    field :project, Types::ProjectType, null: true

    def resolve(assignment_required_code_resource_id:)
      assignment_required = AssignmentRequiredCodeResource.find(assignment_required_code_resource_id)

      project = Project.find_by_slug_or_id! (assignment_required.assignment.project_id)

      authorize project, :destroy_assignment_required_code_resource?

        assignment_required.solution = nil
        assignment_required.save!
        
        return ({
          project: project
        })
        end
end