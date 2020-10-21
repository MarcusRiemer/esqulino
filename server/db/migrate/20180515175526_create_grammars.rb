class CreateGrammars < ActiveRecord::Migration[5.1]
  def change
    create_table :grammars, id: :uuid do |t|
      t.string :name, null: false
      t.string :slug, null: false
      t.jsonb :model, null: false
      t.timestamps
    end

    add_reference :block_languages, :grammar, index: true, type: :uuid
    add_foreign_key :block_languages, :grammars

    add_reference :grammars, :programming_language, index: true, type: :text
    add_foreign_key :grammars, :programming_languages
  end
end
