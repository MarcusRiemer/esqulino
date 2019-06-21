class AddTypeToIdentities < ActiveRecord::Migration[5.2]
  def change
    add_column :identities, :type, :string
  end
end
