class CreateProjects < ActiveRecord::Migration[5.1]
  def change
    enable_extension 'pgcrypto' unless extension_enabled?('pgcrypto')
<<<<<<< HEAD
    create_table :projects, id: :uuid, default: 'gen_random_uuid()' do |t|
=======
    create_table :projects, id: :uuid do |t|
>>>>>>> master
      t.string :name
      t.text :description
      t.boolean :public
      t.uuid :preview
      t.uuid :index_image_id
      t.string :active_database
      t.timestamps
    end
  end
end
