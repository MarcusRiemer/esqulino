class CreateAssignmentRequiredCodeResources < ActiveRecord::Migration[6.1]
  def change
    create_table :assignment_required_code_resource, id: :uuid, default: 'gen_random_uuid()' do |t|
      t.text :resource_type
      t.references :assignment, null: false, type: :uuid, foreign_key: true
      
      t.timestamps
    end
  end
end
