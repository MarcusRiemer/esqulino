class AddForeignKeys < ActiveRecord::Migration[5.1]
  def change
    add_foreign_key :code_resources, :projects
    add_foreign_key :project_sources, :projects
  end
end
