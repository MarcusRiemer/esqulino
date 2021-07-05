class Mutations::Projects::CreateAssignmentRequiredCodeResource< Mutations::BaseMutation
    argument :assignment_id, ID, required: true
    argument :name, String, required: true
    argument :resource_type, String, required: true
    argument :description, String, required: false

    field :project, Types::ProjectType, null: true

    def resolve(assignment_id:, name:, resource_type:, description: nil)
      assignment = Assignment.find(assignment_id)

      project = Project.find_by_slug_or_id! (assignment.project_id)

      authorize project, :create_update_assignment_required_code_resource?

  
      # Its easer for the Frontend. If there is a empty "" we want to see the whole assignment description
      description =  description.blank? ? nil : description

        #TODO: Wie kann ich das anders lösen ?   
        a = AssignmentRequiredCodeResource.new(assignment_id: assignment_id, name: name, resource_type: resource_type,description: description)
        a.save!
        return ({
          project: project
        })
        end
end