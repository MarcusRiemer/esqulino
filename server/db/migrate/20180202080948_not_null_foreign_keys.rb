class NotNullForeignKeys < ActiveRecord::Migration[5.1]
  def change
    change_column_null :code_resources, :project_id, false
    change_column_null :project_sources, :project_id, false
  end
end
