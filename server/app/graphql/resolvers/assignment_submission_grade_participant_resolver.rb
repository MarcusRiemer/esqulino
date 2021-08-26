class Resolvers::AssignmentSubmissionGradeParticipantResolver < GraphQL::Schema::Resolver
  def resolve
    user = context[:user]

    object.assignment_submission_grades.left_outer_joins(:assignment_submission_grade_users).where('assignment_submission_grade_users.user_id = ?
        ', user.id).first
  end
end
