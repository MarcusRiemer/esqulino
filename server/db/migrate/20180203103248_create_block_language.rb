class CreateBlockLanguage < ActiveRecord::Migration[5.1]
  def change
    drop_table(:language_models)

    create_table :block_languages, id: :uuid do |t|
      t.string :name, null: false
      t.string :family, null: false
      t.json :model

      t.timestamps
    end

    add_reference :code_resources, :block_language, index: true, type: :uuid, null: false
    add_foreign_key :code_resources, :block_languages
  end
end
