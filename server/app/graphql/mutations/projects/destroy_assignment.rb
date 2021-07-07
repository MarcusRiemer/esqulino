class Mutations::Projects::DestroyAssignment < Mutations::BaseMutation
    argument :id, ID, required: true

    field :project, Types::ProjectType, null: true

    def resolve(id:)
      
      assignment = Assignment.find(id)

      project = Project.find_by_slug_or_id! (assignment.project_id)

      authorize project, :destroy_assignment?
      
      if AssignmentSubmission.where(assignment_id: id).count > 0
        raise ArgumentError.new "Can´t delete a assignment which have a submission."
      end

      assignment.destroy!

        return ({
          project: project
        })
        end
end