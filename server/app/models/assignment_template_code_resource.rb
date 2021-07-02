class AssignmentTemplateCodeResource < ApplicationRecord
    #Code Resource that reflects the template
    belongs_to :code_resource

    #A template can be assigned to a task
    belongs_to :assignment_required_code_resource

    #Represent the possible template types
    enum reference_type: {
        given_partially: 0,
        given_full: 1
    }
end
