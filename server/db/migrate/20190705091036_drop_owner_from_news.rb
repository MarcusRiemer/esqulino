class DropOwnerFromNews < ActiveRecord::Migration[5.2]
  def change
    remove_column :news, :user_id
  end
end
