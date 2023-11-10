class AddSlugToBlockLanguage < ActiveRecord::Migration[5.1]
  def change
    add_column :block_languages, :slug, :string
    add_index :block_languages, :slug, unique: true
  end
end
