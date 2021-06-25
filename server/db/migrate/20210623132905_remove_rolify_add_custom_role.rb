class RemoveRolifyAddCustomRole < ActiveRecord::Migration[6.1]
  def change
    # No longer use the polymorphic association
    remove_column :roles, :resource_id, :uuid
    remove_column :roles, :resource_type, :text

    # Give the table a primary key so it can be a model
    add_column :users_roles, :id, :uuid, primary_key: true, default: "gen_random_uuid()"
    # Follow ruby naming conventions for the model
    rename_table :users_roles, :user_roles
  end
end
