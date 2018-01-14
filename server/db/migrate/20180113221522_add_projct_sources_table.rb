class AddProjctSourcesTable < ActiveRecord::Migration[5.1]
  def change
    create_table :project_sources do |t|
      t.references :project, type: :uuid
      t.string :url
      t.string :title
      t.text :display
      t.boolean :read_only, default: true
      t.timestamps
    end
  end
end
