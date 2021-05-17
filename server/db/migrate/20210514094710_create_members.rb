class CreateMembers < ActiveRecord::Migration[6.1]
  def change
    create_table :project_members do |t|
      
      t.timestamp :joined_at
      t.references :user, null: false, type: :uuid, foreign_key: true
      t.references :project, null: false, type: :uuid, foreign_key: true
      t.integer :type, null: false

      t.timestamps
    end
  end
end
