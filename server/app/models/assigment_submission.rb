class AssigmentSubmission < ApplicationRecord
    belongs_to :assigment
    belongs_to :assigment_submission_grade, optional: true
end
