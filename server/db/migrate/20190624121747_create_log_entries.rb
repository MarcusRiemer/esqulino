class CreateLogEntries < ActiveRecord::Migration[5.2]
  def change
    create_table :log_entries, id: :uuid, default: 'gen_random_uuid()' do |t|
      t.string :event_type
      t.datetime :created_at, null: false
      t.references :user, type: :uuid, foreign_key: true, null: true
      t.jsonb :data
    end
  end
end
