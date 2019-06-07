class DropBlockLanguageGeneratorsTable < ActiveRecord::Migration[5.2]
  def up
    remove_foreign_key :block_languages, :block_language_generators
    remove_column :block_languages, :block_language_generator_id
    drop_table :block_language_generators
  end
end
