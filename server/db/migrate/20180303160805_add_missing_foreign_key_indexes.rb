class AddMissingForeignKeyIndexes < ActiveRecord::Migration[5.1]
  def change
    add_index :projects, :default_database_id
  end
end
