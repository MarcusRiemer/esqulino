class CreateBlockLanguageGenerators < ActiveRecord::Migration[5.1]
  def change
    create_table :block_language_generators, id: :uuid do |t|
      t.string :name, null: false
      t.string :target_name, null: false
      t.jsonb :model, null: false

      t.timestamps
    end

    # Block languages may reference the generators that created them
    add_reference :block_languages, :block_language_generator, index: true, type: :uuid, foreign_key: true
  end
end
