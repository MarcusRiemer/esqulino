class CreateIdentities < ActiveRecord::Migration[5.2]
  def change
    create_table :identities, { id: false } do |t|
      t.string :id
      t.string :email
      t.string :password

      t.timestamps
    end
  end
end
