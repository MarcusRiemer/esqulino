class AddOwnerToProject < ActiveRecord::Migration[5.2]
  def change
    add_reference :projects, :user, type: :uuid, index: true
  end
end
