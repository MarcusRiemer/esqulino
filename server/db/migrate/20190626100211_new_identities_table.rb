class NewIdentitiesTable < ActiveRecord::Migration[5.2]
  def change
    drop_table :identities do |t|
      t.string :uid, null: false
      t.string :provider, null: false
      t.jsonb :data, null: false
      t.string :type, null: false
      t.references :user_id
      t.jsonb :own_data, null: false
    end

    create_table :identities, id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
      t.string "uid"
      t.string "provider"
      t.jsonb "provider_data"
      t.jsonb "own_data"
      t.string "type"
      t.belongs_to :user, :foreign_key => 'user_id', type: :uuid
      t.timestamps
    end
  end
end
