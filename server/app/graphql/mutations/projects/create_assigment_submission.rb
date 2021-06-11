class  Mutations::Projects::CreateAssigmentSubmission < Mutations::BaseMutation
    argument :assigment_id, ID, required:true

    field :project, Types::ProjectType, null: true

    def resolve(assigment_id:)
        assigment = Assigment.find(assigment_id)
        project = Project.find_by_slug_or_id! (assigment.project.id)

        authorize project, :create_assigment_submission?
  
        assigment.assigment_submissions.create()
          
          return ({
            project: project
          })
      end

end