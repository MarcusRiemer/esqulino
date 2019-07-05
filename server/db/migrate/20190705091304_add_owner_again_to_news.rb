class AddOwnerAgainToNews < ActiveRecord::Migration[5.2]
  def change
    add_reference :news, :user, type: :uuid, index: true
  end
end
