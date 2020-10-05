class User < ActiveRecord::Migration[5.2]
  def change
    create_table :users, id: :uuid, default: 'gen_random_uuid()' do |t|
      t.string :display_name

      t.timestamps
    end

    create_table :identities, id: :uuid, default: 'gen_random_uuid()' do |t|
      t.string :uid
      t.string :provider
      t.jsonb :data
      t.references :user, type: :uuid, foreign_key: true
      t.timestamps
    end
  end
end
