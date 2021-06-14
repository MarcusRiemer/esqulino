class Mutations::Projects::CreateAssignmentSubmissionGrade < Mutations::BaseMutation
    argument :assignment_submission_id,ID, required: true
    argument :feedback, String, required: false
    argument :grade, Integer, required: true
    argument :evaluted_people_ids, [ID], required: true

    field :project, Types::ProjectType, null: true

    def resolve(assignment_submission_id:, feedback: nil , grade:, evaluted_people_ids:)
        assignment_submission = AssignmentSubmission.find(assignment_submission_id)
        project = Project.find_by_slug_or_id! (assignment_submission.assignment.project.id)

        authorize project, :create_assignment_submission_grade?
        
        #TODO: Outsource upper limit and maybe Lower limit 
        if grade < 0 || grade > 100
          raise ArgumentError.new "The Grade must be a value between 0-100"
        end

        if evaluted_people_ids.length == 0
          raise ArgumentError.new "The number of evaluated persons must not be 0"
        end

        ActiveRecord::Base.transaction do
            grade = AssignmentSubmissionGrade.create(user_id: current_user.id, feedback:  feedback, grade: grade, assignment_submission_id: assignment_submission_id)
        
            evaluted_people_ids.each do |id|
              user = User.find(id)
              if project.member_role(user) == nil
                raise ArgumentError.new "On of the evaluted_peoples are not a member of the project "
              end
              grade.assignment_submission_grade_users.create(user_id: id)
            end
        end

          return ({
            project: project
          })
          end
end