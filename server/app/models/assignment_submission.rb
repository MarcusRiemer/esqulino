class AssignmentSubmission < ApplicationRecord
    #Assignment to which the levies relate
    belongs_to :assignment

    # Evaluation of the submitted solutions
    belongs_to :assignment_submission_grade, optional: true

    # Abgegebene Code Resoursen
    has_many :assignment_submitted_code_resource 
end
