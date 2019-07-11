class AddForeignKeyUserProject < ActiveRecord::Migration[5.2]
  def change
    add_foreign_key :projects, :users
    add_foreign_key :news, :users
  end
end
