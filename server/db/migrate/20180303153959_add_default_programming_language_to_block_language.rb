class AddDefaultProgrammingLanguageToBlockLanguage < ActiveRecord::Migration[5.1]
  def change
    add_column :block_languages, :default_programming_language_id, :text
    add_foreign_key :block_languages, :programming_languages, column: :default_programming_language_id
    add_index :block_languages, :default_programming_language_id
  end
end
