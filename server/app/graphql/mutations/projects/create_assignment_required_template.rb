
#TODO:  refactoring - Leonardo
class Mutations::Projects::CreateAssignmentRequiredTemplate < Mutations::BaseMutation
    argument :assignment_id, ID, required: true
    argument :name, String, required: true
    argument :programming_language_id, ID, required: true
    argument :description, String, required: false
    argument :reference_type, Types::AssignmentTemplateCodeResourceType::ReferenceTypeEnum, required: true
    argument :block_language_id, ID, required: true
    
    field :project, Types::ProjectType, null: true

    def resolve(assignment_id:, name:, programming_language_id:, description: nil, reference_type:, block_language_id:)
      assignment = Assignment.find(assignment_id)

      project = Project.find_by_slug_or_id! (assignment.project_id)

      authorize project, :create_update_assignment_required_code_resource?

  
      # Its easer for the Frontend. If there is a empty "" we want to see the whole assignment description
      description =  description.blank? ? nil : description

        #TODO: Wie kann ich das anders lösen ?   
        a = AssignmentRequiredCodeResource.new(assignment_id: assignment_id, name: name, programming_language_id: programming_language_id, description: description)
        
        ActiveRecord::Base.transaction do
            a.save!
            c = CodeResource.new
            c.name = name
            c.project = project
            c.programming_language_id = programming_language_id
            c.block_language_id = block_language_id
            c.save!
            template = AssignmentTemplateCodeResource.new
            template.reference_type = reference_type
            template.code_resource = c
            template.assignment_required_code_resource = a
            template.save!
          end
        
        return ({
          project: project
        })
        end
end