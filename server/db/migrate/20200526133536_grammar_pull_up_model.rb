class GrammarPullUpModel < ActiveRecord::Migration[6.0]
  # Ensure that a model class for this migration is available
  # https://railsguides.net/change-data-in-migrations-like-a-boss/
  class Grammar < ActiveRecord::Base
  end

  def change
    add_column :grammars, :types, :jsonb, :default => Hash.new
    add_column :grammars, :foreign_types, :jsonb, :default => Hash.new
    add_column :grammars, :root, :jsonb

    change_column_null :grammars, :model, true

    reversible do |change|
      change.up do
        Grammar.all.each do |g|
          g.types = g.model.fetch("types", Hash.new)
          g.foreign_types = g.model.fetch("foreign_types", Hash.new)
          g.root = g.model["root"]

          g.save!
        end
      end
    end
  end
end
