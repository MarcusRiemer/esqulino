class AssignmentSubmittedCodeResource < ApplicationRecord
    #Whose "group" the code resource refers to
    belongs_to :assignment_submission

    #Code resource with which the assignment should be solved
    belongs_to :code_resource, :dependent => :destroy

    # Requirement to be met with this code
    belongs_to :assignment_required_code_resource
end
