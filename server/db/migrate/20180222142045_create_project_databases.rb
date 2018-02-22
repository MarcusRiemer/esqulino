class CreateProjectDatabases < ActiveRecord::Migration[5.1]
  def change
    # New table for databases that belong to projects
    create_table :project_databases, id: :uuid, default: 'gen_random_uuid()' do |t|
      t.string :name
      t.references :project, type: :uuid
      t.jsonb :schema

      t.timestamps
    end

    # Every project may have one default database assigned
    remove_column :projects, :active_database
    add_column :projects, :default_database_id, :uuid

    # Of course we want foreign keys
    add_foreign_key :project_databases, :projects
    add_foreign_key :projects, :project_databases, column: :default_database_id
  end
end
