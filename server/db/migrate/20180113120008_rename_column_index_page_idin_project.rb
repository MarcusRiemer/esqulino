class RenameColumnIndexPageIdinProject < ActiveRecord::Migration[5.1]
  def change
    rename_column :projects, :index_image_id, :index_page_id
  end
end
