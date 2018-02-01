class CreateCodeResources < ActiveRecord::Migration[5.1]
  def change
    create_table :code_resources, id: :uuid do |t|
      t.string :name, null: false
      t.json :ast, null: true
      t.references :project, type: :uuid

      t.timestamps
    end
  end
end
