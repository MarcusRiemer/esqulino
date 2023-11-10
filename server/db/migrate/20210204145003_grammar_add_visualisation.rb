class GrammarAddVisualisation < ActiveRecord::Migration[6.1]
  def change
    add_column :grammars, :visualisations, :jsonb, default: {}
    add_column :grammars, :foreign_visualisations, :jsonb, default: {}
  end
end
