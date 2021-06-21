class  Mutations::Projects::CreateAssignmentSubmission < Mutations::BaseMutation
    argument :assignment_id, ID, required:true
    argument :project_id, ID, required:true

    field :project, Types::ProjectType, null: true

    def resolve(assignment_id:, project_id:)
        assignment = Assignment.find(assignment_id)
        project = Project.find_by_slug_or_id! (project_id)

        authorize project, :create_assignment_submission?
  
        assignment.assignment_submissions.create(project_id: project.id)
          
          return ({
            project: project
          })
      end

end