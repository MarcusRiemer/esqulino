class GrammarAddVisualisation < ActiveRecord::Migration[6.1]
  def change
    add_column :grammars, :visualisations, :jsonb, :default => Hash.new
    add_column :grammars, :foreign_visualisations, :jsonb, :default => Hash.new
  end
end
