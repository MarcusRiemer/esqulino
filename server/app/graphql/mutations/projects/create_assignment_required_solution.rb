
#TODO: Die Validierung, ob es sich bei der code_resource um eines des Projektes handelt eventuell in der Code Rresource selbst validieren ? 
# Problem: es ist ein mega aufwand, die verschiedenen Beziehungen entlangzuhangeln. 
class Mutations::Projects::CreateAssignmentRequiredSolution < Mutations::BaseMutation
    argument :assignment_required_code_resource_id, ID, required: true
    argument :block_language_id, ID, required: true


    field :project, Types::ProjectType, null: true

    def resolve(assignment_required_code_resource_id:, block_language_id: )
      assignment_required = AssignmentRequiredCodeResource.find(assignment_required_code_resource_id)

      project = Project.find_by_slug_or_id! (assignment_required.assignment.project_id)

      authorize project, :create_update_assignment_required_code_resource?

      if assignment_required.template.present? && assignment_required.template.reference_type == "given_full"
        raise ArgumentError.new("Can not create a solution for a fully given template")
      end

      if BlockLanguage.find(block_language_id).default_programming_language.id != assignment_required.programming_language.id
        raise ArgumentError.new("The programming_language is not supported by the block_language")
      end

        ActiveRecord::Base.transaction do
          c = CodeResource.new(name: assignment_required.name, project: project, programming_language_id: assignment_required.programming_language_id, block_language_id: block_language_id)  
          c.save!

          assignment_required.solution = c
          assignment_required.save!
          end
        
        return ({
          project: project
        })
        end
end