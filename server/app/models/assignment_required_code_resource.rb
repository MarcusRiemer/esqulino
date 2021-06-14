class AssignmentRequiredCodeResource < ApplicationRecord
    # Assignment that needs this code resource type 
    belongs_to: assignment

    # Possible solutions to this requirement
    has_many: assignment_submitted_code_resources
end
