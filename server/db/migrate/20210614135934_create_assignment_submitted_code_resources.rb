class CreateAssignmentSubmittedCodeResources < ActiveRecord::Migration[6.1]
  def change
    create_table :assignment_submitted_code_resources, id: :uuid, default: 'gen_random_uuid()' do |t|
      t.references :assignment_required_code_resource, null: false, type: :uuid, foreign_key: true, index: { name: 'index_assignment_submission_c_r_on_assignment_required_c_r' }
      t.references :code_resource, null: false, type: :uuid, foreign_key: true # , index: {unique: true}. full_given templates . It is a real referenze
      t.references :assignment_submission, null: false, type: :uuid, foreign_key: true, index: { name: 'index_assignment_submitted_c_r_on_assignment_submission' }

      t.timestamps
    end
  end
end
