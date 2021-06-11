class AddReferencesForTheAssigments < ActiveRecord::Migration[6.1]
  def change
    add_reference  :assigment_code_resources, :assigment, null: false, type: :uuid, foreign_key: true
    add_reference :assigment_code_resources, :code_resource, null: false, type: :uuid, foreign_key: true

    add_reference :assigment_submission_grades, :user, null: false, type: :uuid, foreign_key: true
    add_reference :assigment_submission_grades, :assigment_submission, null: false, type: :uuid, foreign_key: true

    add_reference :assigment_submissions, :assigment, null: false, type: :uuid, foreign_key: true


    add_reference :assigments, :project, null: false, type: :uuid, foreign_key: true
  end
end
