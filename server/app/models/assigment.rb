class Assigment < ApplicationRecord
    belongs_to :project
    has_many :assigment_submissions
    has_many :assigment_code_resources
    has_many :code_resources, through:  :assigment_code_resources
end
