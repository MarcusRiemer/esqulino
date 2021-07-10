class CreateAssignmentRequiredCodeResources < ActiveRecord::Migration[6.1]
  def change
    create_table :assignment_required_code_resources, id: :uuid, default: 'gen_random_uuid()' do |t|
      t.string :name
      t.text :description
      t.references :assignment, null: false, type: :uuid, foreign_key: true
      t.references :code_resource, null: true, type: :uuid, foreign_key: true
      t.references :programming_language, null: false, type: :text, foreign_key: true, index: {:name => "index_assignment_submitted_c_r_on_programming_language"} 
      t.timestamps
    end

  end
end
