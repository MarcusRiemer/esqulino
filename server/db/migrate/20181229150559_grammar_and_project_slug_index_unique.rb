class GrammarAndProjectSlugIndexUnique < ActiveRecord::Migration[5.2]
  def change
    remove_index :projects, :slug
    add_index :projects, :slug, unique: true
    add_index :grammars, :slug, unique: true
  end
end
