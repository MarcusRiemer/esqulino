class AssigmentSubmissionGrade < ApplicationRecord
belongs_to :user   
has_many :assigment_submission_grade_users
has_many :auditees, class_name: 'User', :foreign_key => 'assigment_submission_grade_id', through:  :assigment_submission_grade_users, :source => :user    
has_one :assigment_submission
end
