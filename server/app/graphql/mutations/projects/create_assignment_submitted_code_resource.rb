class Mutations::Projects::CreateAssignmentSubmittedCodeResource < Mutations::BaseMutation
    argument :assignment_submission_id, ID, required: true
    argument :assignment_required_code_resource_id, ID, required: true


    field :project, Types::ProjectType, null: true

    def resolve(assignment_submission_id:, assignment_required_code_resource_id:)
        assignment_submission = AssignmentSubmission.find(assignment_submission_id)
        required_code_resource = AssignmentRequiredCodeResource(assignment_required_code_resource_id)

        project = Project.find_by_slug_or_id! (assignment_submission.assignment.project.id)
        
        authorize project, :create_update_assignment?

        ActiveRecord::Base.transaction do
            assignment_submitted = AssignmentSubmittedCodeResource.new()


            #TODO: Effizienter gestalten indem man sich mit einer Query alle Templates holt um weniger abfragen zu habe ? 
            if required_code_resource.is_template()
                if required_code_resource.template.create_copy?
                    
                else
                    assignment_submitted.code_resource_id = required_code_resource.template.code_resource.id
                end

  
                
            else
                #TODO: Woher weiß ich was für weitere Attribute die Code Resource besitzt. Eventuell immer eine Code Resource vorgeben ? 
            end
        end
  
        Assignment.create(project_id: project.id, name: name, description: description, start_date: start_date, end_date: end_date, weight: weight)
  
          return ({
            project: project
          })
          end   
end