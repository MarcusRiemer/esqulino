class AssignmentSubmissionGradeUser < ApplicationRecord
    belongs_to :user
    belongs_to :assignment_submission_grade
end