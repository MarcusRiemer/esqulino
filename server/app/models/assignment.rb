class Assignment < ApplicationRecord
    # Each Assignment is assigned to a project 
    belongs_to :project

    # Possible solutions for the Assignment 
    has_many :assignment_submissions

    # Required file formats to successfully pass the Assignment
    has_many :assignment_required_code_resources
end
