class CreateLanguageModels < ActiveRecord::Migration[5.1]
  def change
    enable_extension 'pgcrypto' unless extension_enabled? 'pgcrypto'

    create_table :language_models, id: :uuid do |t|
      t.string :name

      t.json :model

      t.timestamps
    end
  end
end
