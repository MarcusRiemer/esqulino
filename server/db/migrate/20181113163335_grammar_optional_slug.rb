class GrammarOptionalSlug < ActiveRecord::Migration[5.2]
  def change
    change_column_null :grammars, :slug, true
  end
end
