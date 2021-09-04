class CreateMembers < ActiveRecord::Migration[6.1]
  def change
    create_table :project_members, id: :uuid, default: 'gen_random_uuid()' do |t|
      t.timestamp :joined_at
      t.references :user, null: false, type: :uuid, foreign_key: true
      t.references :project, null: false, type: :uuid, foreign_key: true
      t.integer :membership_type, null: false

      t.timestamps
    end

    add_index :project_members,
              %i[user_id project_id],
              unique: true,
              name: 'project_member_references_unique'
  end
end
