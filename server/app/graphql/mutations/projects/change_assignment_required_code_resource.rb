class Mutations::Projects::ChangeAssignmentRequiredCodeResource < Mutations::BaseMutation
    argument :id, ID, required: true
    argument :name, String, required: false
    argument :resource_type, String, required: false
    argument :description, String, required: false


    field :project, Types::ProjectType, null: true

    def resolve(**args)
      
      assignment_required_cd = AssignmentRequiredCodeResource.find(args[:id])

     assignment = Assignment.find(assignment_required_cd.assignment_id)
    
      project = Project.find_by_slug_or_id! (assignment.project_id)

      authorize project, :create_update_assignment_required_code_resource?

      if args.key?(:description) && args[:description].blank?
        args[:description] = nil
      end


      assignment_required_cd.assign_attributes(args)
      assignment_required_cd.save!

        return ({
          project: project
        })
        end
end