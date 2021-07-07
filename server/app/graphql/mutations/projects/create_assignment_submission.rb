class  Mutations::Projects::CreateAssignmentSubmission < Mutations::BaseMutation
    argument :assignment_id, ID, required:true
    argument :project_id, ID, required:true

    field :project, Types::ProjectType, null: true

    def resolve(assignment_id:, project_id:)
        project = Project.find_by_slug_or_id! (project_id)

        project.assert_is_participant_course!()

        assignment = project.based_on_project.assignments.find(assignment_id)

        authorize project, :create_assignment_submission?

        project.assignment_submissions.create(assignment_id: assignment.id)
        project.save!
          
          return ({
            project: project
          })
      end

end