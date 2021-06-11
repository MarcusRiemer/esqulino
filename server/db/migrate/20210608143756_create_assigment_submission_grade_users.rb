class CreateAssigmentSubmissionGradeUsers < ActiveRecord::Migration[6.1]
  def change
    create_table :assigment_submission_grade_users do |t|
      t.references :user, null: false, type: :uuid, foreign_key: true
      t.references :assigment_submission_grade, null: false, type: :uuid, foreign_key: true, index: {:name => "index_assigment_submission_grade"}

      t.timestamps
    end
    add_index :assigment_submission_grade_users,
    [:user_id, :assigment_submission_grade_id],
    :unique => true,
    :name => 'user_assigment_submission_grade_references_unique'
  end
end
