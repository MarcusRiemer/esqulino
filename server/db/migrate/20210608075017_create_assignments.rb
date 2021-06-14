class CreateAssignments < ActiveRecord::Migration[6.1]
  def change
    create_table :assignments, id: :uuid, default: 'gen_random_uuid()' do |t|
      t.string :name
      t.timestamp :start_date
      t.timestamp :end_date
      t.text :description

      t.timestamps
    end
  end
end
