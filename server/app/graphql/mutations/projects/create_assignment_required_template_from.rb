
class Mutations::Projects::CreateAssignmentRequiredTemplateFrom < Mutations::BaseMutation
    argument :assignment_id, ID, required: true
    argument :code_resource_id, ID, required: true
    #The Name will changed only if they will a deep copy 
    argument :name, String, required: false
    argument :description, String, required: false
    argument :reference_type, Types::AssignmentTemplateCodeResourceType::ReferenceTypeEnum, required: true
    argument :deep_copy, Boolean, required: true
    
    
    field :project, Types::ProjectType, null: true

    def resolve(assignment_id:, code_resource_id:, name: nil, description: nil, reference_type:, deep_copy:)
      assignment = Assignment.find(assignment_id)
      code_resource = CodeResource.find(code_resource_id)

      project = Project.find_by_slug_or_id! (assignment.project_id)

      if(code_resource.project != project)
        raise ArgumentError.new "The code resource is not a resource of this project."
      end

      authorize project, :create_update_assignment_required_code_resource?

  
      # Its easer for the Frontend. If there is a empty "" we want to see the whole assignment description
      description =  description.blank? ? nil : description


      name = name.blank? ? code_resource.name : name

        #TODO: Wie kann ich das anders lösen ?   
        a = AssignmentRequiredCodeResource.new(assignment_id: assignment_id, name: name, programming_language_id: code_resource.programming_language_id, description: description)
        
        ActiveRecord::Base.transaction do
            a.save!

            if deep_copy
                code_resource = code_resource.dup
                code_resource.name = name
                code_resource.save!
            end
            template = AssignmentTemplateCodeResource.new
            template.reference_type = reference_type
            template.code_resource = code_resource
            template.assignment_required_code_resource = a
            template.save!
          end
        
        return ({
          project: project
        })
        end
end