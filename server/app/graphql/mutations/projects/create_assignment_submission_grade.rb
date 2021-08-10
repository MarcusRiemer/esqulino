class Mutations::Projects::CreateAssignmentSubmissionGrade < Mutations::BaseMutation
  argument :assignment_submission_id, ID, required: true
  argument :feedback, String, required: false
  argument :grade, Integer, required: true
  argument :evaluted_people_ids, [ID], required: true

  field :project, Types::ProjectType, null: true

  def resolve(assignment_submission_id:, evaluted_people_ids:, grade:, feedback: nil)
    assignment_submission = AssignmentSubmission.find(assignment_submission_id)
    course = Project.find_by_slug_or_id!(assignment_submission.assignment.project.id)

    group = Project.find_by_slug_or_id!(assignment_submission.project.id)

    authorize course, :create_assignment_submission_grade?

    raise ArgumentError, 'The number of evaluated persons must not be 0' if evaluted_people_ids.length == 0

    ActiveRecord::Base.transaction do
      grade = AssignmentSubmissionGrade.new(user_id: current_user.id, feedback: feedback, grade: grade, assignment_submission_id: assignment_submission_id)
      grade.save!

      evaluted_people_ids.each do |id|
        user = User.find(id)
        raise ArgumentError, 'On of the evaluted_peoples are not a member of the project ' if group.member_role(user) != 'participant'

        # Delete the user out of the grade nad create a new one
        if user.has_grade_for?(assignment_submission)

          old_grade = user.grades.find_by(assignment_submission_id: assignment_submission.id)
          if old_grade.assignment_submission_grade_users.count == 1
            old_grade.destroy!
          else
            old_grade.assignment_submission_grade_users.find_by(user_id: user.id).destroy!
          end
        end

        grade.assignment_submission_grade_users.create(user_id: id)
      end
    end

    {
      project: group
    }
  end
end
