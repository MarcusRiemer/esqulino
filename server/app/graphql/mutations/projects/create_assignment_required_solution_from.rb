
#TODO: Die Validierung, ob es sich bei der code_resource um eines des Projektes handelt eventuell in der Code Rresource selbst validieren ? 
# Problem: es ist ein mega aufwand, die verschiedenen Beziehungen entlangzuhangeln. 
class Mutations::Projects::CreateAssignmentRequiredSolutionFrom < Mutations::BaseMutation
    argument :assignment_required_code_resource_id, ID, required: true
    argument :code_resource_id, ID, required: true
    argument :deep_copy, Boolean, required: true

    field :project, Types::ProjectType, null: true

    def resolve(assignment_required_code_resource_id:, code_resource_id:, deep_copy: )
      assignment_required = AssignmentRequiredCodeResource.find(assignment_required_code_resource_id)

      project = Project.find_by_slug_or_id! (assignment_required.assignment.project_id)

      code_resource = CodeResource.find(code_resource_id)

      if code_resource.project != project
        raise ArgumentError.new "The code resource is not a resource of this project."
      end

      authorize project, :create_update_assignment_required_code_resource?


      if assignment_required.template.present? && assignment_required.template.reference_type == "given_full"
        raise ArgumentError.new("Can not create a solution for a fully given template")
      end

      if code_resource.programming_language.id != assignment_required.programming_language.id
        raise ArgumentError.new("The Code Resource have not the same programming language like the assignment required")
      end



        ActiveRecord::Base.transaction do
          if deep_copy
            code_resource = code_resource.dup
            code_resource.save!
          end

          assignment_required.solution = code_resource
          assignment_required.save!
          end
        
        return ({
          project: project
        })
        end
end