class CreateAssignmentSubmissionGradeUsers < ActiveRecord::Migration[6.1]
  def change
    create_table :assignment_submission_grade_users, id: :uuid, default: 'gen_random_uuid()' do |t|
      t.references :user, null: false, type: :uuid, foreign_key: true
      t.references :assignment_submission_grade, null: false, type: :uuid, foreign_key: true, index: {:name => "index_assignment_submission_grade"}

      t.timestamps
    end
    add_index :assignment_submission_grade_users,
    [:user_id, :assignment_submission_grade_id],
    :unique => true,
    :name => 'user_assignment_submission_grade_references_unique'
  end
end
