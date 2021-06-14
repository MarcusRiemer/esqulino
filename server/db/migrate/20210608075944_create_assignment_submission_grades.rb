class CreateAssignmentSubmissionGrades < ActiveRecord::Migration[6.1]
  def change
    create_table :assignment_submission_grades, id: :uuid, default: 'gen_random_uuid()' do |t|
      t.text :feedback
      t.integer :grade
      t.timestamps
    end
  end
end
