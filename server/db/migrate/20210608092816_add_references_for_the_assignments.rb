class AddReferencesForTheAssignments < ActiveRecord::Migration[6.1]
  def change
    add_reference :assignment_submission_grades, :user, null: false, type: :uuid, foreign_key: true
    add_reference :assignment_submission_grades, :assignment_submission, null: false, type: :uuid, foreign_key: true

    add_reference :assignment_submissions, :assignment, null: false, type: :uuid, foreign_key: true


    add_reference :assignments, :project, null: false, type: :uuid, foreign_key: true
  end
end
