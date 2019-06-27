class AddOwnDataToIdentities < ActiveRecord::Migration[5.2]
  def change
    add_column :identities, :own_data, :jsonb
  end
end
