class CreateAssigmentCodeResources < ActiveRecord::Migration[6.1]
  def change
    create_table :assigment_code_resources, id: :uuid, default: 'gen_random_uuid()' do |t|
      t.integer :resource_type, null: false
      #t.references :assigment, null: false, type: :uuid, foreign_key: true
      #t.references :code_resource, null: false, type: :uuid, foreign_key: true
      t.timestamps
    end
  end
end
