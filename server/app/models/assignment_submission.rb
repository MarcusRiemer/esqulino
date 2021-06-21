class AssignmentSubmission < ApplicationRecord
    #Assignment to which the levies relate
    belongs_to :assignment

    # Evaluation of the submitted solutions
    belongs_to :assignment_submission_grade, optional: true

    #Thats the group which create this submission
    belongs_to :project

    # Code resources delivered
    has_many :assignment_submitted_code_resource 
end
