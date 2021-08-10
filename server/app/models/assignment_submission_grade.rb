class AssignmentSubmissionGrade < ApplicationRecord
  belongs_to :user
  has_many :assignment_submission_grade_users, dependent: :destroy
  has_many :auditees, class_name: 'User', foreign_key: 'assignment_submission_grade_id', through: :assignment_submission_grade_users, source: :user
  belongs_to :assignment_submission

  validates :grade, inclusion: 0..100
end
