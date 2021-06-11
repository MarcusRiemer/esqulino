class AssigmentSubmissionGradeUser < ApplicationRecord
    belongs_to :user
    belongs_to :assigment_submission_grade
end