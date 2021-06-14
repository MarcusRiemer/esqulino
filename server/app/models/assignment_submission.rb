class AssignmentSubmission < ApplicationRecord
    belongs_to :assignment
    belongs_to :assignment_submission_grade, optional: true
end
