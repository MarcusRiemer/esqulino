class AssignmentSubmissionGrade < ApplicationRecord
belongs_to :user   
has_many :assignment_submission_grade_users
has_many :auditees, class_name: 'User', :foreign_key => 'assignment_submission_grade_id', through:  :assignment_submission_grade_users, :source => :user    
has_one :assignment_submission
end
