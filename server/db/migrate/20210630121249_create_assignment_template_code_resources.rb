class CreateAssignmentTemplateCodeResources < ActiveRecord::Migration[6.1]
  def change
    create_table :assignment_template_code_resources, id: :uuid, default: 'gen_random_uuid()'  do |t|

      t.references :code_resource, null: false, type: :uuid, foreign_key: true, index: {:name => "index_assignment_template_on_code_resource"}
      t.references :assignment_required_code_resource, null: false, type: :uuid, foreign_key: true, index: {:name => "index_assignment_template_on_assignment_required"}
      t.integer :reference_type, null: false


      t.timestamps
    end
  end
end
