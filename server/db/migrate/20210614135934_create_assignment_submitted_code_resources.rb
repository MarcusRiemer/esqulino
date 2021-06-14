class CreateAssignmentSubmittedCodeResources < ActiveRecord::Migration[6.1]
  def change
    create_table :assignment_submitted_code_resources, id: :uuid, default: 'gen_random_uuid()' do |t|
      t.references :assignment_required_code_resource, null: true, type: :uuid, foreign_key: true
      t.references :code_resource, null: false, type: :uuid, foreign_key: true
      t.references :assigment_submission, null: false, type: :uuid, foreign_key: true

      t.timestamps
    end
  end
end
