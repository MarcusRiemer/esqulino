class Assignment < ApplicationRecord
    belongs_to :project
    has_many :assignment_submissions
    has_many :assignment_code_resources
    has_many :code_resources, through:  :assignment_code_resources
end
