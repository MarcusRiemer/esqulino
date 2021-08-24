class AssignmentSubmission < ApplicationRecord
  # Assignment to which the levies relate
  belongs_to :assignment

  # Evaluation of the submitted solutions
  has_many :assignment_submission_grades

  # Thats the group which create this submission
  belongs_to :project

  # Code resources delivered
  has_many :assignment_submitted_code_resources, dependent: :destroy
end
