class CreateNews < ActiveRecord::Migration[5.2]
  def change
    enable_extension 'hstore' unless extension_enabled?('hstore')
    create_table :news, id: :uuid, default: 'gen_random_uuid()' do |t|
      t.hstore :title
      t.hstore :text
      t.date :publish_from

      t.timestamps
    end
  end
end
