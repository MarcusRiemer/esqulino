class Mutations::Projects::DestroyAssignment < Mutations::BaseMutation
    argument :assignment_id, ID, required: true

    field :project, Types::ProjectType, null: true

    def resolve(assignment_id:)
      
      assignment = Assignment.find(assignment_id)

      project = Project.find_by_slug_or_id! (assignment.project_id)

      authorize project, :destroy_assignment?
      
      if AssignmentSubmission.where(assignment_id: assignment_id).count > 0
        raise ArgumentError.new "Can´t delete a assignment which have a submission."
      end

      assignment.destroy!

      #assignment.update( name: name, description: description, start_date: start_date, end_date: end_date, weight: weight) 

        return ({
          project: project
        })
        end
end