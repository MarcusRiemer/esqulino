class CreateProjects < ActiveRecord::Migration[5.1]
  def change
    enable_extension 'pgcrypto' unless extension_enabled?('pgcrypto')
    create_table :projects, id: :uuid do |t|
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
