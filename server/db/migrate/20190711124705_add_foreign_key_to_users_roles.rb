class AddForeignKeyToUsersRoles < ActiveRecord::Migration[5.2]
  def change
    add_foreign_key :users_roles, :users
    add_foreign_key :users_roles, :roles
  end
end
